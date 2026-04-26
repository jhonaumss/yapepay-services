import { pool } from "../db/client";
import {
  GetCurrentUserOperationServerInput,
  GetCurrentUserOperationServerOutput,
} from "@yapepay/service-ssdk";

export async function getCurrentUserHandler(
  userId: string,
  input: GetCurrentUserOperationServerInput
): Promise<GetCurrentUserOperationServerOutput> {
  const result = await pool.query(
    `SELECT "userId", "phoneNumber", "fullName", "email", "kycStatus", "createdAt"
     FROM usuario WHERE "userId" = $1`,
    [userId]
  );
  if (result.rows.length === 0) throw new Error("User not found");

  const row = result.rows[0];
  return {
    user: {
      userId: row.userId,
      phoneNumber: row.phoneNumber,
      fullName: row.fullName,
      email: row.email,
      kycStatus: row.kycStatus,
      createdAt: row.createdAt,
    },
  };
}