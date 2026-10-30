import {
  closeSync,
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  unlinkSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseSync } from "node:sqlite";
import { createDemoDataset, demoPlans, DEMO_AS_OF } from "./demo";
import {
  LOCAL_APPLICATION_ID,
  LOCAL_SCHEMA,
  LOCAL_SCHEMA_VERSION,
} from "./local-schema";

export function getLocalDatabasePath(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const directory =
    environment.VERCEL === "1"
      ? join(tmpdir(), `nattitor-demo-v${LOCAL_SCHEMA_VERSION}`)
      : join(process.cwd(), ".data");
  return join(directory, "nattitor.sqlite");
}

function initializeNewDatabase(filePath: string): void {
  const directory = dirname(filePath);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  // Publish a fully committed database atomically, without replacing another file.
  const temporaryPath = join(directory, `.nattitor-${randomUUID()}.sqlite`);
  closeSync(openSync(temporaryPath, "wx", 0o600));
  try {
    const database = new DatabaseSync(temporaryPath);
    try {
      database.exec("BEGIN IMMEDIATE");
      database.exec(LOCAL_SCHEMA);
      database
        .prepare("INSERT INTO metadata (key, value) VALUES (?, ?)")
        .run("as_of", DEMO_AS_OF);
      const dataset = createDemoDataset();
      const insertCustomer = database.prepare(
        "INSERT INTO customers (id, name, email, created_at, status) VALUES (?, ?, ?, ?, ?)",
      );
      for (const customer of dataset.customers) {
        insertCustomer.run(
          customer.id,
          customer.name,
          customer.email,
          customer.created_at,
          customer.status,
        );
      }
      const insertPlan = database.prepare(
        "INSERT INTO plans (id, plan_name, monthly_price_cents) VALUES (?, ?, ?)",
      );
      for (const plan of demoPlans) {
        insertPlan.run(
          plan.id,
          plan.plan_name,
          Math.round(plan.monthly_price * 100),
        );
      }
      const customerIds = new Map(
        dataset.customers.map((item) => [item.email, item.id]),
      );
      const planIds = new Map(
        demoPlans.map((item) => [item.plan_name, item.id]),
      );
      const insertTransaction = database.prepare(
        "INSERT INTO transactions (id, customer_id, plan_id, amount_cents, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      );
      for (const transaction of dataset.transactions) {
        const customerId = customerIds.get(transaction.customer.email);
        const planId = planIds.get(transaction.plan);
        if (!customerId || !planId)
          throw new Error("Invalid local fixture reference");
        insertTransaction.run(
          transaction.id,
          customerId,
          planId,
          Math.round(transaction.amount * 100),
          transaction.status,
          transaction.created_at,
        );
      }
      database.exec("COMMIT");
    } catch (error) {
      if (database.isTransaction) database.exec("ROLLBACK");
      throw error;
    } finally {
      database.close();
    }
    try {
      linkSync(temporaryPath, filePath);
    } catch (error) {
      // Another process may have initialized the same path first.
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ))
        throw error;
    }
  } finally {
    // This path was exclusively created above; never remove the destination.
    unlinkSync(temporaryPath);
  }
}

export function openLocalDatabase(path = getLocalDatabasePath()): DatabaseSync {
  // Runtime-owned storage is not a build asset and must not be bundled.
  const filePath = resolve(/* turbopackIgnore: true */ path);
  if (!existsSync(/* turbopackIgnore: true */ filePath))
    initializeNewDatabase(filePath);
  const file = lstatSync(filePath);
  if (!file.isFile() || file.isSymbolicLink()) {
    throw new Error(
      "The local database must be a regular file, not a symbolic link",
    );
  }
  const database = new DatabaseSync(filePath, {
    readOnly: true,
    timeout: 5000,
  });
  try {
    const applicationId = database
      .prepare("PRAGMA application_id")
      .get()?.application_id;
    const version = database.prepare("PRAGMA user_version").get()?.user_version;
    if (
      applicationId !== LOCAL_APPLICATION_ID ||
      version !== LOCAL_SCHEMA_VERSION
    ) {
      throw new Error(
        "Unrecognized local database or unsupported schema version; the existing file was not changed",
      );
    }
    database.exec("PRAGMA query_only = ON");
    database.function("search_fold", { deterministic: true }, (value) =>
      typeof value === "string" ? value.toLocaleLowerCase("en-US") : "",
    );
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}
