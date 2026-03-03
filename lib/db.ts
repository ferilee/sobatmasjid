import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/db/schema";

const host = process.env.DB_HOST || "127.0.0.1";
const port = Number(process.env.DB_PORT || "3306");
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "sobatmasjid";

const globalForDb = globalThis as typeof globalThis & {
  sobatPool?: mysql.Pool;
};

const pool =
  globalForDb.sobatPool ||
  mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sobatPool = pool;
}

export const db = drizzle({ client: pool, schema, mode: "default" });
