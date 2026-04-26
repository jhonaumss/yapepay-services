import { pool } from "../db/client";
import {
  GetQROperationServerInput,
  GetQROperationServerOutput,
} from "@yapepay/service-ssdk";

export async function getQRHandler(
  userId: string,
  input: GetQROperationServerInput
): Promise<GetQROperationServerOutput> {
  const result = await pool.query(
    `SELECT * FROM codigoqr WHERE "qrId" = $1`,
    [input.qrId]
  );

  if (result.rows.length === 0) throw new Error("QR not found");

  const row = result.rows[0];

  // Solo el propietario puede ver su QR
  if (row.userId !== userId) throw new Error("QR not found");

  return {
    qrCode: {
      qrId: row.qrId,
      userId: row.userId,
      amount: row.amount?.toString(),
      currency: row.currency,
      description: row.description,
      qrData: row.qrData,
      expiresAt: row.expiresAt,
      used: row.used,
    },
  };
}