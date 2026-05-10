import { pool } from "../db/client";
import {
  GetTransactionOperationServerInput,
  GetTransactionOperationServerOutput,
} from "@yapepay/service-ssdk";

export async function getTransactionHandler(
  input: GetTransactionOperationServerInput,
  userId: string
): Promise<GetTransactionOperationServerOutput> {
  const result = await pool.query(
    `SELECT * FROM transaccion WHERE "txId" = $1`,
    [input.txId]
  );

  if (result.rows.length === 0) {
    throw { message: "Transaction not found", code: "NOT_FOUND" };
  }

  const row = result.rows[0];

  if (row.senderId !== userId && row.receiverId !== userId) {
    throw { message: "Transaction not found", code: "NOT_FOUND" };
  }

  return {
    transaction: {
      txId: row.txId,
      senderId: row.senderId,
      receiverId: row.receiverId,
      amount: row.amount.toString(),
      currency: row.currency,
      type: row.type,
      status: row.status,
      description: row.description,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    },
  };
}
