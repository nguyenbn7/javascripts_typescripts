import type { Database } from "./types";

import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const { DATABASE_URL } = process.env;

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: DATABASE_URL,
  }),
});

const db = new Kysely<Database>({
  dialect,
});

export default db;
