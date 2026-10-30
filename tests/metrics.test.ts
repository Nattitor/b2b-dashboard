import test from "node:test";
import assert from "node:assert/strict";
import { createDemoDataset, DEMO_AS_OF } from "../lib/demo";
import { filterLedger, buildSnapshot } from "../lib/metrics";
import type {
  Customer,
  Dataset,
  LedgerFilters,
  Transaction,
} from "../lib/types";

const customer: Customer = {
  id: "c1",
  name: "Acme North",
  email: "owner@acme.example",
  created_at: "2024-01-01T00:00:00.000Z",
  status: "Active",
};
const tx = (
  id: string,
  date: string,
  amount: number,
  status: Transaction["status"] = "Success",
  name = customer.name,
  email = customer.email,
  plan = "Basic",
): Transaction => ({
  id,
  amount,
  status,
  created_at: date,
  customer: { name, email },
  plan,
});
const ledgerFilters = (patch: Partial<LedgerFilters> = {}): LedgerFilters => ({
  page: 1,
  pageSize: 10,
  sortBy: "created_at",
  order: "asc",
  query: "",
  status: "All",
  ...patch,
});
const dataset = (
  transactions: Transaction[],
  customers: Customer[] = [customer],
): Dataset => ({ transactions, customers });

test("sums successful, pending and failed amounts in cents; only Success is revenue", () => {
  const s = buildSnapshot(
    dataset([
      tx("a", "2026-10-02T00:00:00.000Z", 0.1),
      tx("b", "2026-10-03T00:00:00.000Z", 0.2),
      tx("p", "2026-10-04T00:00:00.000Z", 7.25, "Pending"),
      tx("f", "2026-10-05T00:00:00.000Z", 3.5, "Failed"),
    ]),
    "2026-10-30T12:00:00.000Z",
  );
  assert.equal(s.revenue, 0.3);
  assert.equal(s.successfulPayments, 2);
  assert.equal(s.pendingAmount, 7.25);
  assert.equal(s.pendingCount, 1);
  assert.equal(s.failedAmount, 3.5);
  assert.equal(s.failedCount, 1);
});

test("compares equal elapsed UTC periods and clips comparison across January", () => {
  const s = buildSnapshot(
    dataset([
      tx("old", "2025-12-01T00:00:00.000Z", 20),
      tx("baseline", "2025-12-10T12:00:00.000Z", 10),
      tx("now", "2026-01-10T12:00:00.000Z", 20),
    ]),
    "2026-01-10T12:00:00.000Z",
  );
  assert.equal(s.revenue, 20);
  // Both windows include the same exact UTC cutoff; prior revenue is 20 + 10.
  assert.ok(Math.abs(s.revenueGrowth! - -100 / 3) < 1e-10);
  assert.equal(s.successfulPayments, 1);
  assert.equal(s.paymentGrowth, -50);
});

test("month-short baseline has matching elapsed span and UTC month boundaries", () => {
  const s = buildSnapshot(
    dataset([
      tx("prior", "2026-01-28T23:59:59.999Z", 4),
      tx("beyond", "2026-01-29T00:00:00.000Z", 50),
      tx("current", "2026-02-28T23:59:59.999Z", 8),
      tx("after", "2026-03-01T00:00:00.000Z", 100),
    ]),
    "2026-02-28T23:59:59.999Z",
  );
  assert.equal(s.revenue, 8);
  assert.equal(s.revenueGrowth, 100);
});

test("chart always has 12 chronological months, including empty months", () => {
  const s = buildSnapshot(
    dataset([tx("old", "2026-10-02T00:00:00.000Z", 9)]),
    "2026-10-30T12:00:00.000Z",
  );
  assert.equal(s.chart.length, 12);
  assert.deepEqual(
    s.chart.map((p) => p.date.slice(0, 7)),
    [
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
    ],
  );
  assert.equal(s.chart[0].revenue, 0);
  assert.equal(s.chart[11].revenue, 9);
});

test("active customers differ from new customer signups and future signups are excluded", () => {
  const inactive: Customer = {
    ...customer,
    id: "c2",
    status: "Inactive",
    created_at: "2026-10-03T00:00:00.000Z",
  };
  const future: Customer = {
    ...customer,
    id: "c3",
    status: "Active",
    created_at: "2026-10-31T00:00:00.000Z",
  };
  const s = buildSnapshot(
    dataset([], [customer, inactive, future]),
    "2026-10-30T12:00:00.000Z",
  );
  assert.equal(s.activeCustomers, 1);
  assert.equal(s.newCustomers, 1);
});

test("success rate uses all current payments, not recurring revenue amounts", () => {
  const s = buildSnapshot(
    dataset([
      tx("paid", "2026-10-02T00:00:00.000Z", 200, "Success"),
      tx("failed", "2026-10-03T00:00:00.000Z", 1, "Failed"),
      tx("pending", "2026-10-04T00:00:00.000Z", 999, "Pending"),
    ]),
    "2026-10-30T12:00:00.000Z",
  );
  assert.equal(s.successRate, 100 / 3);
});

test("filters ID, name, email literally, case-insensitively, and combines status", () => {
  const rows = [
    tx(
      "a+b",
      "2026-01-01T00:00:00.000Z",
      1,
      "Success",
      "Acme [North]",
      "a+b@acme.example",
    ),
    tx(
      "other",
      "2026-01-02T00:00:00.000Z",
      2,
      "Failed",
      "Beta",
      "beta@example",
    ),
  ];
  assert.equal(
    filterLedger(rows, ledgerFilters({ query: "a+b" })).data[0].id,
    "a+b",
  );
  assert.equal(
    filterLedger(rows, ledgerFilters({ query: "[north]" })).data.length,
    1,
  );
  assert.equal(
    filterLedger(rows, ledgerFilters({ query: "BETA@EXAMPLE" })).data[0].id,
    "other",
  );
  assert.deepEqual(
    filterLedger(rows, ledgerFilters({ query: "acme", status: "Failed" })).data,
    [],
  );
  assert.deepEqual(
    filterLedger(
      rows,
      ledgerFilters({ query: "acme", status: "Success" }),
    ).data.map((x) => x.id),
    ["a+b"],
  );
});

test("out-of-range and empty pagination return safe page and accurate count", () => {
  const rows = [
    tx("a", "2026-01-01T00:00:00.000Z", 1),
    tx("b", "2026-01-02T00:00:00.000Z", 2),
  ];
  assert.deepEqual(
    filterLedger(rows, ledgerFilters({ page: 99, pageSize: 1 })),
    { data: [rows[1]], totalCount: 2, page: 2, pageSize: 1 },
  );
  assert.deepEqual(filterLedger([], ledgerFilters({ page: 5 })), {
    data: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
});

test("sort tie-break is deterministic and input array remains unchanged", () => {
  const rows = [
    tx("z", "2026-01-01T00:00:00.000Z", 5),
    tx("a", "2026-01-01T00:00:00.000Z", 5),
    tx("m", "2026-01-02T00:00:00.000Z", 1),
  ];
  const before = [...rows];
  assert.deepEqual(
    filterLedger(
      rows,
      ledgerFilters({ sortBy: "amount", order: "desc" }),
    ).data.map((x) => x.id),
    ["a", "z", "m"],
  );
  assert.deepEqual(rows, before);
});

test("demo fixture is deterministic, synthetic, and contains no payment before customer creation", () => {
  const a = createDemoDataset();
  const b = createDemoDataset();
  assert.deepEqual(a, b);
  assert.equal(DEMO_AS_OF, "2026-10-30T12:00:00.000Z");
  assert.ok(a.customers.every((c) => c.email.endsWith(".example")));
  const created = new Map(a.customers.map((c) => [c.email, c.created_at]));
  assert.ok(
    a.transactions.every((t) => t.created_at >= created.get(t.customer.email)!),
  );
  assert.ok(a.customers.length > 0 && a.transactions.length > 0);
});
