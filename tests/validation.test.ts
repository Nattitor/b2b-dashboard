import test from "node:test";
import assert from "node:assert/strict";
import {
  parseLedgerResult,
  parseSnapshot,
  parseTransaction,
} from "../lib/validation";
import { createDemoDataset, DEMO_AS_OF } from "../lib/demo";
import { buildSnapshot } from "../lib/metrics";

const dataset = createDemoDataset();
const transaction = dataset.transactions[0];

test("accepts typed snapshot and normalizes numeric database strings", () => {
  const snapshot = buildSnapshot(dataset, DEMO_AS_OF);
  assert.deepEqual(
    parseSnapshot(JSON.parse(JSON.stringify(snapshot))),
    snapshot,
  );
  assert.equal(
    parseTransaction({ ...transaction, amount: "49.25" }).amount,
    49.25,
  );
});

test("rejects malformed or unsafe database responses", () => {
  for (const amount of [null, undefined, {}, "", "NaN", "Infinity", -1]) {
    assert.throws(() => parseTransaction({ ...transaction, amount }));
  }
  assert.throws(() => parseTransaction({ ...transaction, status: "Paid" }));
  assert.throws(() =>
    parseTransaction({ ...transaction, created_at: "not-a-date" }),
  );
  assert.throws(() => parseTransaction({ ...transaction, customer: null }));
  assert.throws(() =>
    parseTransaction({ ...transaction, plan: "x".repeat(101) }),
  );
  assert.throws(() =>
    parseSnapshot({
      ...buildSnapshot(dataset, DEMO_AS_OF),
      chart: Array(13).fill({}),
    }),
  );
});

test("bounds ledger response size and validates integer pagination", () => {
  assert.deepEqual(
    parseLedgerResult({ data: [], totalCount: 0, page: 1, pageSize: 10 }),
    { data: [], totalCount: 0, page: 1, pageSize: 10 },
  );
  for (const patch of [
    { data: Array(11).fill(transaction) },
    { page: 0 },
    { page: 1.2 },
    { totalCount: -1 },
    { pageSize: 1000 },
  ]) {
    assert.throws(() =>
      parseLedgerResult({
        data: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        ...patch,
      }),
    );
  }
});
