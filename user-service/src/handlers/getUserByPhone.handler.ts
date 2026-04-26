import { pool } from "../db/client";

export async function getUserByPhoneHandler(phoneNumber: string) {
  const result = await pool.query(
    `SELECT "userId", "phoneNumber", "fullName", "kycStatus"
     FROM usuario WHERE "phoneNumber" = $1`,
    [phoneNumber]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  return { user: result.rows[0] };
}