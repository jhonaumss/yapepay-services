import { pool } from "../db/client";
import {
  UpdateCurrentUserOperationServerInput,
  UpdateCurrentUserOperationServerOutput,
} from "@yapepay/service-ssdk";

export async function updateCurrentUserHandler(
  userId: string,
  input: UpdateCurrentUserOperationServerInput
): Promise<UpdateCurrentUserOperationServerOutput> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (input.updates?.fullName) {
    fields.push(`"fullName" = $${idx++}`);
    values.push(input.updates.fullName);
  }
  if (input.updates?.email) {
    fields.push(`"email" = $${idx++}`);
    values.push(input.updates.email);
  }

  if (fields.length === 0) throw new Error("No fields to update");

  fields.push(`"updatedAt" = NOW()`);
  values.push(userId);

  const result = await pool.query(
    `UPDATE usuario SET ${fields.join(", ")}
     WHERE "userId" = $${idx}
     RETURNING "userId", "phoneNumber", "fullName", "email", "kycStatus", "createdAt"`,
    values
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