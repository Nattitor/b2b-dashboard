import test from "node:test";
import assert from "node:assert/strict";
import { growth, ledgerSearchParams, parseLedgerFilters } from "../lib/filters";
import type { LedgerFilters } from "../lib/types";

test("parses and sanitizes page, decimal, negative, Infinity, arrays and unsupported options", () => {
  assert.deepEqual(parseLedgerFilters({ page: "-2" }), {
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    order: "desc",
    query: "",
    status: "All",
  });
  assert.equal(parseLedgerFilters({ page: "2.5" }).page, 1);
  assert.equal(parseLedgerFilters({ page: "Infinity" }).page, 1);
  assert.equal(parseLedgerFilters({ page: "100001" }).page, 100000);
  assert.equal(parseLedgerFilters({ page: ["3", "9"] }).page, 3);
  assert.equal(
    parseLedgerFilters({
      sortBy: "customer",
      order: "sideways",
      status: "Unknown",
    }).sortBy,
    "created_at",
  );
  assert.equal(
    parseLedgerFilters({ sortBy: "amount", order: "asc", status: "Unknown" })
      .status,
    "All",
  );
  assert.equal(
    parseLedgerFilters({ sortBy: "amount", order: "asc" }).sortBy,
    "amount",
  );
  assert.equal(parseLedgerFilters({ order: "asc" }).order, "asc");
});

test("trims and caps query to 100 characters", () => {
  const parsed = parseLedgerFilters({ q: `  ${"x".repeat(120)}  ` });
  assert.equal(parsed.query.length, 100);
  assert.equal(parsed.query, "x".repeat(100));
  assert.equal(
    parseLedgerFilters({ q: ["  exact  ", "ignored"] }).query,
    "exact",
  );
});

test("serializes only non-default ledger parameters with URL encoding", () => {
  const filters: LedgerFilters = {
    page: 4,
    pageSize: 10,
    sortBy: "amount",
    order: "asc",
    query: "Jane & Co",
    status: "Success",
  };
  assert.equal(
    ledgerSearchParams(filters),
    "q=Jane+%26+Co&status=Success&sortBy=amount&order=asc&page=4",
  );
  assert.equal(
    ledgerSearchParams({
      page: 1,
      pageSize: 10,
      sortBy: "created_at",
      order: "desc",
      query: "",
      status: "All",
    }),
    "",
  );
});

test("growth handles zero baseline without Infinity", () => {
  assert.equal(growth(10, 0), null);
  assert.equal(growth(0, 0), 0);
  assert.equal(growth(15, 10), 50);
});
