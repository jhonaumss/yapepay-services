import { pool } from "../db/client";
import { v4 as uuidv4 } from "uuid";
import {
  GenerateQROperationServerInput,
  GenerateQROperationServerOutput,
} from "@yapepay/service-ssdk";

export async function generateQRHandler(
  userId: string,
  input: GenerateQROperationServerInput
): Promise<GenerateQROperationServerOutput> {
  const ttlMinutes = input.ttlMinutes ?? 15;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // qrData es un JSON codificado que contiene la info del pago
  const qrData = JSON.stringify({
    qrId: uuidv4(),
    userId,
    amount: input.amount ?? null,
    currency: input.currency ?? "BOB",
    description: input.description ?? null,
    expiresAt: expiresAt.toISOString(),
  });

  const result = await pool.query(
    `INSERT INTO codigoqr ("userId", "amount", "currency", "description", "qrData", "expiresAt")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      input.amount ? parseFloat(input.amount) : null,
      input.currency ?? "BOB",
      input.description ?? null,
      qrData,
      expiresAt,
    ]
  );

  const row = result.rows[0];
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