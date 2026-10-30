import { getLocalDatabasePath, openLocalDatabase } from "../lib/local-database";

// Initializes only a missing file. Existing files are opened read-only and validated.
try {
  const database = openLocalDatabase();
  try {
    console.log(
      JSON.stringify(
        {
          path: getLocalDatabasePath(),
          source: "local SQLite",
          asOf: database
            .prepare("SELECT value FROM metadata WHERE key = 'as_of'")
            .get()?.value,
          customers: database
            .prepare("SELECT COUNT(*) AS count FROM customers")
            .get()?.count,
          plans: database.prepare("SELECT COUNT(*) AS count FROM plans").get()
            ?.count,
          transactions: database
            .prepare("SELECT COUNT(*) AS count FROM transactions")
            .get()?.count,
          webAccess: "read-only",
        },
        null,
        2,
      ),
    );
  } finally {
    database.close();
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Local database unavailable",
  );
  process.exitCode = 1;
}
