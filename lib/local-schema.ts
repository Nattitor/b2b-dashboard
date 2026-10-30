export const LOCAL_APPLICATION_ID = 0x4e415454;
export const LOCAL_SCHEMA_VERSION = 1;

// Applied only to a newly created temporary database, never an existing file.
export const LOCAL_SCHEMA = `
  CREATE TABLE metadata (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  ) STRICT;

  CREATE TABLE customers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 255),
    email TEXT NOT NULL UNIQUE CHECK (length(email) BETWEEN 1 AND 255),
    created_at TEXT NOT NULL CHECK (
      created_at GLOB '????-??-??T??:??:??.???Z' AND datetime(created_at) IS NOT NULL
    ),
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive'))
  ) STRICT;

  CREATE TABLE plans (
    id TEXT PRIMARY KEY NOT NULL,
    plan_name TEXT NOT NULL UNIQUE CHECK (length(plan_name) BETWEEN 1 AND 100),
    monthly_price_cents INTEGER NOT NULL CHECK (monthly_price_cents >= 0)
  ) STRICT;

  CREATE TABLE transactions (
    id TEXT PRIMARY KEY NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    plan_id TEXT NOT NULL REFERENCES plans(id),
    amount_cents INTEGER NOT NULL CHECK (amount_cents BETWEEN 0 AND 9007199254740991),
    status TEXT NOT NULL CHECK (status IN ('Success', 'Pending', 'Failed')),
    created_at TEXT NOT NULL CHECK (
      created_at GLOB '????-??-??T??:??:??.???Z' AND datetime(created_at) IS NOT NULL
    )
  ) STRICT;

  CREATE INDEX transactions_date ON transactions(created_at DESC, id);
  CREATE INDEX transactions_amount ON transactions(amount_cents, id);
  CREATE INDEX transactions_status_date ON transactions(status, created_at DESC, id);
  CREATE INDEX transactions_customer ON transactions(customer_id);
  CREATE INDEX transactions_plan ON transactions(plan_id);
  PRAGMA application_id = ${LOCAL_APPLICATION_ID};
  PRAGMA user_version = ${LOCAL_SCHEMA_VERSION};
`;
