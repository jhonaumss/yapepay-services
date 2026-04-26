import { pool } from "./client";

async function migrate() {
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
    await pool.end();
  }
}

migrate().catch(console.error);