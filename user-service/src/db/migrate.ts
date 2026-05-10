import { Client } from "pg";
import { pool } from "./client";

const DB_NAME = process.env.DB_NAME ?? "yapepay_users";

async function ensureDatabase(): Promise<void> {
  const admin = new Client({
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5433"),
    user: process.env.DB_USER ?? "yapepay",
    password: process.env.DB_PASSWORD ?? "yapepay123",
    database: "postgres",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
  await admin.connect();
  try {
    const { rows } = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_NAME]
    );
    if (rows.length === 0) {
      await admin.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Created database: ${DB_NAME}`);
    }
  } finally {
    await admin.end();
  }
}

async function migrate() {
  await ensureDatabase();
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        "userId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "phoneNumber" VARCHAR(12) NOT NULL UNIQUE,
        "fullName" VARCHAR(100) NOT NULL CHECK (length("fullName") >= 2),
        "email" VARCHAR(254) UNIQUE,
        "pinHash" CHAR(60) NOT NULL,
        "kycStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING'
          CHECK ("kycStatus" IN ('PENDING','BASIC_VERIFIED','FULL_VERIFIED','REJECTED')),
        "deviceToken" VARCHAR(512),
        "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
        "lockedUntil" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_usuario_phone
      ON usuario("phoneNumber");
    `);

    console.log("Migration completed successfully - users");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);