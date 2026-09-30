import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

// Disable prefetch/prepare for compatibility with connection poolers (PgBouncer)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);
