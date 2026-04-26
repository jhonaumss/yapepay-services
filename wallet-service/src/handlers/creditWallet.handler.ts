import { pool } from "../db/client";

interface CreditInput {
  userId: string;
  amount: number;
}

export async function creditWalletHandler(input: CreditInput) {
  const result = await pool.query(
    `UPDATE billetera
     SET "balance" = "balance" + $1, "updatedAt" = NOW()
     WHERE "userId" = $2
     RETURNING *`,
    [input.amount, input.userId]
  );
  if (result.rows.length === 0) throw new Error("Wallet not found");
  return { wallet: result.rows[0] };
}