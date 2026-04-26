import { pool } from "../db/client";

export async function createWalletHandler(userId: string) {
  const result = await pool.query(
    `INSERT INTO billetera ("userId")
     VALUES ($1)
     RETURNING *`,
    [userId]
  );
  return { wallet: result.rows[0] };
}