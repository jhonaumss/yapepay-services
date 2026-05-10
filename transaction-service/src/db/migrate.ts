import { Client } from "pg";
import { pool } from "./client";

const DB_NAME = process.env.DB_NAME ?? "yapepay_transactions";

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
      CREATE TABLE IF NOT EXISTS transaccion (
        "txId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "senderId" UUID NOT NULL,
        "receiverId" UUID NOT NULL,
        "amount" DECIMAL(15,2) NOT NULL CHECK ("amount" > 0),
        "currency" CHAR(3) NOT NULL DEFAULT 'BOB',
        "type" VARCHAR(20) NOT NULL
          CHECK ("type" IN ('P2P_TRANSFER','RECHARGE','PAYMENT_QR','REVERSAL')),
        "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING'
          CHECK ("status" IN ('PENDING','COMPLETED','FAILED','REVERSED')),
        "description" VARCHAR(200),
        "idempotencyKey" UUID NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "completedAt" TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tx_sender 
      ON transaccion("senderId", "createdAt" DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tx_receiver 
      ON transaccion("receiverId", "createdAt" DESC);
    `);

    console.log("Migration completed successfully - transactions");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);