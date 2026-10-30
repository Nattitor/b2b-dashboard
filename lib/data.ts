import "server-only";
import { cache } from "react";
import type { DatabaseSync } from "node:sqlite";
import { openLocalDatabase } from "./local-database";
import { readLocalLedger, readLocalSnapshot } from "./local-queries";
import type { LedgerFilters } from "./types";

function readDatabase<T>(read: (database: DatabaseSync) => T): T {
  let database: DatabaseSync | undefined;
  try {
    database = openLocalDatabase();
    return read(database);
  } catch (error) {
    console.error("Local database query failed", {
      message:
        error instanceof Error ? error.message : "Unknown database error",
    });
    throw new Error("The local dashboard database could not be loaded");
  } finally {
    database?.close();
  }
}

export const getDashboardSnapshot = cache(async () =>
  readDatabase(readLocalSnapshot),
);

export async function getLedger(filters: LedgerFilters) {
  return readDatabase((database) => readLocalLedger(database, filters));
}
