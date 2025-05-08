import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) throw new Error("DATABASE_URL is not found");

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle({
  client: pool,
});

export default db;
