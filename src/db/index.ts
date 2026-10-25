import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./open-data-schema";

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

// Reuse the connection across HMR reloads so dev doesn't exhaust Postgres slots.
const sql =
  globalForDb.sql ?? postgres(process.env.DATABASE_URL!, { max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema });
