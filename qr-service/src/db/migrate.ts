import { pool } from "./client";

export async function runMigration(): Promise<void> {
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
