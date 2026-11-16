import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// In `next dev` files are reloaded often; keep ONE pool on globalThis
// so we do not open a new set of connections on every reload.
const globalForDb = globalThis as unknown as { __dsPool?: Pool };

const pool =
  globalForDb.__dsPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb.__dsPool = pool;

export const db = drizzle({ client: pool, schema });
export { schema };
