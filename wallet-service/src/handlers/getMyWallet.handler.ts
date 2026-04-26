import { pool } from "../db/client";
import {
  GetMyWalletOperationServerInput,
  GetMyWalletOperationServerOutput,
} from "@yapepay/service-ssdk";

export async function getMyWalletHandler(
  userId: string,
  input: GetMyWalletOperationServerInput
): Promise<GetMyWalletOperationServerOutput> {
  console.log(`[getMyWallet] userId=${userId}`);
  const result = await pool.query(
    `SELECT "walletId", "userId", "balance", "currency", "status", "updatedAt"
     FROM billetera WHERE "userId" = $1`,
    [userId]
  );
  if (result.rows.length === 0) throw new Error("Wallet not found");

  const row = result.rows[0];
  return {
    wallet: {
      walletId: row.walletId,
      userId: row.userId,
      balance: row.balance.toString(),
      currency: row.currency,
      status: row.status,
      updatedAt: row.updatedAt,
    },
  };
}