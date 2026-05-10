import { Client } from "pg";
import { pool } from "./client";

async function ensureDatabase(): Promise<void> {
  const dbName = process.env.DB_NAME || "yapepay_qr";
  const admin = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "yapepay",
    password: process.env.DB_PASSWORD || "yapepay123",
    database: "postgres",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
  await admin.connect();
  try {
    const res = await admin.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created`);
    }
  } finally {
    await admin.end();
  }
}

export async function runMigration(): Promise<void> {
  await ensureDatabase();

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS codigoqr (
        "qrId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "amount" DECIMAL(15,2),
        "currency" CHAR(3) NOT NULL DEFAULT 'BOB',
        "description" VARCHAR(200),
        "qrData" TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "used" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_qr_user
      ON codigoqr("userId", "createdAt" DESC);
    `);

    console.log("Migration completed successfully - qr");
  } finally {
    client.release();
  }
}

// CLI mode: node dist/db/migrate.js
if (require.main === module) {
  runMigration().then(() => pool.end()).catch(console.error);
}
