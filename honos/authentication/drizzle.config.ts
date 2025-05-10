import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = process.env;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schemas.ts",
  dbCredentials: {
    url: DATABASE_URL!,
  },
  out: "./drizzle",
});
