import { pool } from "../db/client";
import {
  CreateRechargeOperationServerInput,
  CreateRechargeOperationServerOutput,
  TransactionType,
} from "@yapepay/service-ssdk";

export async function createRechargeHandler(
  userId: string,
  input: CreateRechargeOperationServerInput
): Promise<CreateRechargeOperationServerOutput> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verificar idempotencia
    const existing = await client.query(
      `SELECT "txId" FROM recarga WHERE "idempotencyKey" = $1`,
      [input.idempotencyKey]
    );
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return {
        transaction: existing.rows[0],
        estimatedCreditSeconds: 0,
      };
    }

    if (!input.amount) {
      throw new Error("Amount is required");
    }

    const amount = parseFloat(input.amount);

    // Acreditar billetera
    await client.query(
      `UPDATE billetera
       SET "balance" = "balance" + $1, "updatedAt" = NOW()
       WHERE "userId" = $2`,
      [amount, userId]
    );

    // Registrar recarga
    const result = await client.query(
      `INSERT INTO recarga ("userId", "bankAccountId", "amount", "idempotencyKey", "status")
       VALUES ($1, $2, $3, $4, 'COMPLETED')
       RETURNING *`,
      [userId, input.bankAccountId, amount, input.idempotencyKey]
    );

    await client.query("COMMIT");

    const row = result.rows[0];
    return {
      transaction: {
        txId: row.txId,
        amount: row.amount.toString(),
        status: "COMPLETED",
        createdAt: row.createdAt,
        senderId: userId,
        receiverId: userId,
        currency: "BOB",
        type: TransactionType.RECHARGE
      },
      estimatedCreditSeconds: 0,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}