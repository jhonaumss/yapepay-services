import { pool } from "../db/client";
import {
  CreateRechargeOperationServerOutput,
  TransactionType,
} from "@yapepay/service-ssdk";

interface RechargeInput {
  amount: string | undefined;
  idempotencyKey: string | undefined;
}

const USER_SERVICE_URL = process.env.USER_SERVICE_URL ?? "http://localhost:3001";

async function resolveUserIdByPhone(phoneNumber: string): Promise<string> {
  const internalKey = process.env.INTERNAL_API_KEY ?? "";
  const url = `${USER_SERVICE_URL}/v1/usuarios/portelefono?numero=${encodeURIComponent(phoneNumber)}`;
  const res = await fetch(url, { headers: { "x-internal-key": internalKey } });
  if (res.status === 404) throw new Error(`No user found with phone number ${phoneNumber}`);
  if (!res.ok) throw new Error("Failed to resolve user by phone number");
  const body = await res.json() as { user: { userId: string } };
  return body.user.userId;
}

export async function createRechargeHandler(
  phoneNumber: string,
  input: RechargeInput
): Promise<CreateRechargeOperationServerOutput> {
  const targetUserId = await resolveUserIdByPhone(phoneNumber);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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

    await client.query(
      `UPDATE billetera
       SET "balance" = "balance" + $1, "updatedAt" = NOW()
       WHERE "userId" = $2`,
      [amount, targetUserId]
    );

    const result = await client.query(
      `INSERT INTO recarga ("userId", "amount", "idempotencyKey", "status")
       VALUES ($1, $2, $3, 'COMPLETED')
       RETURNING *`,
      [targetUserId, amount, input.idempotencyKey]
    );

    await client.query("COMMIT");

    const row = result.rows[0];
    return {
      transaction: {
        txId: row.txId,
        amount: row.amount.toString(),
        status: "COMPLETED",
        createdAt: row.createdAt,
        senderId: targetUserId,
        receiverId: targetUserId,
        currency: "BOB",
        type: TransactionType.RECHARGE,
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
