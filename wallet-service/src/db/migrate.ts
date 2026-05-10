import { Client } from "pg";
import { pool } from "./client";

const DB_NAME = process.env.DB_NAME ?? "yapepay_wallets";

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
      CREATE TABLE IF NOT EXISTS billetera (
        "walletId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL UNIQUE,
        "balance" DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK ("balance" >= 0),
        "currency" CHAR(3) NOT NULL DEFAULT 'BOB',
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
          CHECK ("status" IN ('ACTIVE','SUSPENDED','CLOSED')),
        "dailySpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "dailySpentResetAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recarga (
        "txId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "bankAccountId" UUID,
        "amount" DECIMAL(15,2) NOT NULL CHECK ("amount" > 0),
        "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "idempotencyKey" UUID NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Drop NOT NULL on bankAccountId if the table already existed with the constraint
    await client.query(`
      ALTER TABLE recarga ALTER COLUMN "bankAccountId" DROP NOT NULL;
    `).catch(() => { /* column already nullable, ignore */ });

    console.log("Migration completed successfully - wallets");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);