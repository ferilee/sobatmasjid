import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    database: process.env.DB_NAME || "sobatmasjid",
    port: Number(process.env.DB_PORT || "3306"),
    ...(process.env.DB_PASSWORD ? { password: process.env.DB_PASSWORD } : {}),
  },
});
