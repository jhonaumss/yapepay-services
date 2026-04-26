import { pool } from "./client";

async function migrate() {
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