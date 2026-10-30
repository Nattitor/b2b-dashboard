import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getLocalDatabasePath, openLocalDatabase } from "../lib/local-database";
import { readLocalLedger, readLocalSnapshot } from "../lib/local-queries";
import {
  LOCAL_APPLICATION_ID,
  LOCAL_SCHEMA_VERSION,
} from "../lib/local-schema";
import { createDemoDataset, demoPlans, DEMO_AS_OF } from "../lib/demo";
import { buildSnapshot, filterLedger } from "../lib/metrics";
import { parseLedgerFilters } from "../lib/filters";
import type { LedgerFilters } from "../lib/types";

function temporaryDatabase(run: (path: string) => void) {
  const directory = mkdtempSync(join(tmpdir(), "nattitor-db-test-"));
  try {
    run(join(directory, "development.sqlite"));
  } finally {
    // Only remove the unique directory created by this test, under the system temp directory.
    assert.equal(dirname(directory), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith("nattitor-db-test-"));
    rmSync(directory, { recursive: true, force: true });
  }
}

function editDatabase(path: string, edit: (database: DatabaseSync) => void) {
  const database = new DatabaseSync(path);
  try {
    edit(database);
  } finally {
    database.close();
  }
}

test("keeps local storage persistent and uses temporary storage only on Vercel", () => {
  const persistentPath = join(process.cwd(), ".data", "nattitor.sqlite");
  for (const VERCEL of [undefined, "", "0", "true"]) {
    assert.equal(getLocalDatabasePath({ VERCEL }), persistentPath);
  }
  const temporaryPath = join(
    tmpdir(),
    `nattitor-demo-v${LOCAL_SCHEMA_VERSION}`,
    "nattitor.sqlite",
  );
  assert.equal(getLocalDatabasePath({ VERCEL: "1" }), temporaryPath);
  assert.notEqual(temporaryPath, persistentPath);
});

test("creates a complete local database, publishes only the committed file, and preserves it", () => {
  temporaryDatabase((path) => {
    const database = openLocalDatabase(path);
    try {
      assert.equal(
        database.prepare("PRAGMA application_id").get()?.application_id,
        LOCAL_APPLICATION_ID,
      );
      assert.equal(
        database.prepare("PRAGMA user_version").get()?.user_version,
        LOCAL_SCHEMA_VERSION,
      );
      assert.equal(
        database.prepare("SELECT COUNT(*) AS count FROM customers").get()
          ?.count,
        24,
      );
      assert.equal(
        database.prepare("SELECT COUNT(*) AS count FROM plans").get()?.count,
        demoPlans.length,
      );
      assert.equal(
        database.prepare("SELECT COUNT(*) AS count FROM transactions").get()
          ?.count,
        createDemoDataset().transactions.length,
      );
      assert.equal(
        database.prepare("SELECT value FROM metadata WHERE key = 'as_of'").get()
          ?.value,
        DEMO_AS_OF,
      );
      assert.deepEqual(database.prepare("PRAGMA foreign_key_check").all(), []);
    } finally {
      database.close();
    }
    const original = readFileSync(path);
    for (let attempt = 0; attempt < 3; attempt++)
      openLocalDatabase(path).close();
    assert.deepEqual(readFileSync(path), original);
    assert.deepEqual(readdirSync(dirname(path)), [basename(path)]);
  });
});

test("SQLite snapshot matches pure metrics across UTC boundaries and empty periods", () => {
  temporaryDatabase((path) => {
    openLocalDatabase(path).close();
    const dataset = createDemoDataset();
    for (const asOf of [
      DEMO_AS_OF,
      "2026-10-01T00:00:00.000Z",
      "2026-03-31T23:59:59.999Z",
      "2026-01-01T12:30:00.000Z",
      "2024-02-29T12:00:00.000Z",
      "2030-01-01T00:00:00.000Z",
    ]) {
      editDatabase(path, (database) =>
        database
          .prepare("UPDATE metadata SET value = ? WHERE key = 'as_of'")
          .run(asOf),
      );
      const database = openLocalDatabase(path);
      try {
        assert.deepEqual(
          readLocalSnapshot(database),
          buildSnapshot(dataset, asOf),
          asOf,
        );
      } finally {
        database.close();
      }
    }
  });
});

test("SQL ledger matches literal search, filters, deterministic sorting, and clamped pages", () => {
  temporaryDatabase((path) => {
    const database = openLocalDatabase(path);
    try {
      const dataset = createDemoDataset();
      for (const params of [
        {},
        { q: "NORTHSTAR" },
        { status: "Pending", page: "99999" },
        { sortBy: "amount", order: "asc", page: "2" },
        { sortBy: "amount", order: "desc" },
        { sortBy: "created_at", order: "asc" },
        { q: "%_' OR true--" },
        { q: "no-such-customer" },
        { status: "Failed" },
      ]) {
        const filters = parseLedgerFilters(params);
        assert.deepEqual(
          readLocalLedger(database, filters),
          filterLedger(dataset.transactions, filters),
          JSON.stringify(params),
        );
      }
    } finally {
      database.close();
    }
  });
});

test("Unicode case folding preserves the search contract", () => {
  temporaryDatabase((path) => {
    openLocalDatabase(path).close();
    const dataset = createDemoDataset();
    const customer = dataset.customers[0];
    customer.name = "Équipe İstanbul";
    for (const transaction of dataset.transactions) {
      if (transaction.customer.email === customer.email)
        transaction.customer.name = customer.name;
    }
    editDatabase(path, (database) =>
      database
        .prepare("UPDATE customers SET name = ? WHERE id = ?")
        .run(customer.name, customer.id),
    );
    const database = openLocalDatabase(path);
    try {
      for (const query of ["ÉQUIPE", "İSTANBUL", "équipe i̇stanbul"]) {
        const filters = parseLedgerFilters({ q: query });
        const result = readLocalLedger(database, filters);
        assert.ok(result.totalCount > 0);
        assert.deepEqual(result, filterLedger(dataset.transactions, filters));
      }
    } finally {
      database.close();
    }
  });
});

test("local edits survive reopening without reseeding and retain integer-cent precision", () => {
  temporaryDatabase((path) => {
    openLocalDatabase(path).close();
    const dataset = createDemoDataset();
    const changed = dataset.transactions.at(-1)!;
    changed.amount = 123.45;
    editDatabase(path, (database) =>
      database
        .prepare("UPDATE transactions SET amount_cents = ? WHERE id = ?")
        .run(12345, changed.id),
    );
    const original = readFileSync(path);
    const database = openLocalDatabase(path);
    try {
      assert.deepEqual(
        readLocalSnapshot(database),
        buildSnapshot(dataset, DEMO_AS_OF),
      );
      const result = readLocalLedger(
        database,
        parseLedgerFilters({ q: changed.id }),
      );
      assert.equal(result.totalCount, 1);
      assert.equal(result.data[0].amount, 123.45);
    } finally {
      database.close();
    }
    assert.deepEqual(readFileSync(path), original);
  });
});

test("web connections cannot insert, update, delete, or change the schema", () => {
  temporaryDatabase((path) => {
    const database = openLocalDatabase(path);
    try {
      // Disabling the extra connection guard does not remove the read-only file open mode.
      database.exec("PRAGMA query_only = OFF");
      for (const sql of [
        "DELETE FROM transactions",
        "UPDATE customers SET name = 'changed'",
        "INSERT INTO metadata VALUES ('injected', 'value')",
        "CREATE TABLE injected (value TEXT)",
        "PRAGMA user_version = 99",
      ]) {
        assert.throws(() => database.exec(sql), /readonly|read.only/i);
      }
    } finally {
      database.close();
    }
  });
});

test("rejects foreign, blank, and invalid existing files without modifying them", () => {
  for (const kind of ["foreign", "blank", "invalid"]) {
    temporaryDatabase((path) => {
      if (kind === "foreign")
        editDatabase(path, (database) =>
          database.exec(
            "CREATE TABLE unrelated (value TEXT); INSERT INTO unrelated VALUES ('preserve me')",
          ),
        );
      else writeFileSync(path, kind === "blank" ? "" : "not a SQLite database");
      const original = readFileSync(path);
      assert.throws(
        () => openLocalDatabase(path),
        /Unrecognized|not a database/i,
      );
      assert.deepEqual(readFileSync(path), original);
    });
  }
});

test("rejects incompatible owned schema versions without migrating", () => {
  temporaryDatabase((path) => {
    openLocalDatabase(path).close();
    editDatabase(path, (database) =>
      database.exec("PRAGMA user_version = 999"),
    );
    const original = readFileSync(path);
    assert.throws(() => openLocalDatabase(path), /unsupported schema version/i);
    assert.deepEqual(readFileSync(path), original);
  });
});

test("SQL queries reject hostile or unbounded parameters", () => {
  temporaryDatabase((path) => {
    const database = openLocalDatabase(path);
    try {
      const filters = parseLedgerFilters({});
      for (const override of [
        { page: -1 },
        { page: 100_001 },
        { page: 1.5 },
        { pageSize: 1000 },
        { sortBy: "amount; DROP TABLE customers" },
        { order: "desc; DELETE FROM transactions" },
        { status: "Unknown" },
        { query: "x".repeat(101) },
      ]) {
        assert.throws(
          () =>
            readLocalLedger(database, {
              ...filters,
              ...override,
            } as LedgerFilters),
          /Invalid ledger parameters/,
        );
        assert.equal(database.isTransaction, false);
      }
    } finally {
      database.close();
    }
  });
});

test("schema enforces foreign keys, statuses, integer cents, and valid timestamps", () => {
  temporaryDatabase((path) => {
    openLocalDatabase(path).close();
    editDatabase(path, (database) => {
      const insert = database.prepare(
        "INSERT INTO transactions (id, customer_id, plan_id, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      );
      const customer = createDemoDataset().customers[0].id;
      const plan = demoPlans[0].id;
      for (const [id, customerId, amount, status, date] of [
        ["bad-reference", "missing", 100, "Success", DEMO_AS_OF],
        ["fractional-cents", customer, 1.25, "Success", DEMO_AS_OF],
        ["negative", customer, -1, "Success", DEMO_AS_OF],
        ["status", customer, 100, "Unknown", DEMO_AS_OF],
        ["timestamp", customer, 100, "Success", "not-a-date"],
      ] as const) {
        assert.throws(
          () => insert.run(id, customerId, plan, amount, status, date),
          /constraint|REAL value/i,
        );
      }
    });
  });
});

test("valid empty local databases remain empty instead of being reseeded", () => {
  temporaryDatabase((path) => {
    openLocalDatabase(path).close();
    editDatabase(path, (database) =>
      database.exec(
        "DELETE FROM transactions; DELETE FROM customers; DELETE FROM plans",
      ),
    );
    const database = openLocalDatabase(path);
    try {
      assert.deepEqual(
        readLocalSnapshot(database),
        buildSnapshot({ customers: [], transactions: [] }, DEMO_AS_OF),
      );
      assert.deepEqual(
        readLocalLedger(database, parseLedgerFilters({ page: "999" })),
        { data: [], totalCount: 0, page: 1, pageSize: 10 },
      );
    } finally {
      database.close();
    }
  });
});

test("failed reads roll back their transaction without hiding invalid data", () => {
  temporaryDatabase((path) => {
    openLocalDatabase(path).close();
    editDatabase(path, (database) =>
      database
        .prepare("UPDATE metadata SET value = 'invalid' WHERE key = 'as_of'")
        .run(),
    );
    const database = openLocalDatabase(path);
    try {
      assert.throws(
        () => readLocalSnapshot(database),
        /Invalid local snapshot date/,
      );
      assert.equal(database.isTransaction, false);
      assert.ok(
        readLocalLedger(database, parseLedgerFilters({})).totalCount > 0,
      );
    } finally {
      database.close();
    }
  });
});
