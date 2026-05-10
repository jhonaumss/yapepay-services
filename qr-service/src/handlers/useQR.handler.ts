import { pool } from "../db/client";

interface UseQRResult {
  receiverUserId: string;
  amount: string | null;
  currency: string;
  description: string | null;
}

export async function useQRHandler(qrId: string): Promise<UseQRResult> {
  const result = await pool.query(
    `UPDATE codigoqr
     SET "used" = true
     WHERE "qrId" = $1 AND "used" = false AND "expiresAt" > NOW()
     RETURNING "userId", "amount", "currency", "description"`,
    [qrId]
  );

  if (result.rowCount === 0) {
    const check = await pool.query(
      `SELECT "used", "expiresAt" FROM codigoqr WHERE "qrId" = $1`,
      [qrId]
    );
    if (check.rowCount === 0) throw new Error("QR not found");
    if (check.rows[0].used) throw new Error("QR already used");
    throw new Error("QR expired");
  }

  const row = result.rows[0];
  return {
    receiverUserId: row.userId,
    amount: row.amount != null ? row.amount.toString() : null,
    currency: row.currency,
    description: row.description,
  };
}
