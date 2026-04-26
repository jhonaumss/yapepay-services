import { pool } from "./client";

async function migrate() {
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
    "bankAccountId" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL CHECK ("amount" > 0),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" UUID NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  );
`);

        console.log("Migration completed successfully - wallets");
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(console.error);