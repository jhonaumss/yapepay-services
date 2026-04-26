import { pool } from "./client";

async function migrate() {
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