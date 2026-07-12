import { pool } from "../db/client";
import { publishTransactionCompleted } from "../sqs/producer";

const QR_SERVICE_URL = process.env.QR_SERVICE_URL || "http://localhost:3004";
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || "http://localhost:3002";

interface QRPaymentInput {
  qrId: string;
  idempotencyKey: string;
  description?: string;
}

interface QRUseResponse {
  receiverUserId: string;
  amount: string | null;
  currency: string;
  description: string | null;
}

export async function createQRTransactionHandler(input: QRPaymentInput, senderId: string) {
  const client = await pool.connect();
  try {
    // 1. Idempotency check
    const existing = await client.query(
      `SELECT * FROM transaccion WHERE "idempotencyKey" = $1`,
      [input.idempotencyKey]
    );
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return {
        transaction: {
          txId: row.txId, senderId: row.senderId, receiverId: row.receiverId,
          amount: row.amount.toString(), currency: row.currency, type: row.type,
          status: row.status, description: row.description,
          createdAt: row.createdAt, completedAt: row.completedAt,
        },
      };
    }

    // 2. Atomically claim the QR — marks it as used, returns payment details
    const internalKey = process.env.INTERNAL_API_KEY ?? "";
    const internalHeaders = { "Content-Type": "application/json", "x-internal-key": internalKey };
    const qrRes = await fetch(`${QR_SERVICE_URL}/v1/qr/${input.qrId}/use`, {
      method: "PATCH",
      headers: { "x-internal-key": internalKey },
    });
    if (!qrRes.ok) {
      const err = await qrRes.json() as { message: string };
      throw { message: err.message, code: "QR_INVALID" };
    }
    const qrData = await qrRes.json() as QRUseResponse;

    if (!qrData.amount) {
      throw { message: "QR code has no fixed amount", code: "QR_NO_AMOUNT" };
    }

    const receiverId = qrData.receiverUserId;
    const amount = parseFloat(qrData.amount);
    const currency = qrData.currency;

    // 3. Debit sender
    const debitRes = await fetch(`${WALLET_SERVICE_URL}/v1/billeteras/debito`, {
      method: "POST",
      headers: internalHeaders,
      body: JSON.stringify({ userId: senderId, amount }),
    });
    if (!debitRes.ok) {
      const err = await debitRes.json() as { message: string };
      throw { code: "INSUFFICIENT_FUNDS", ...err };
    }

    // 4. Credit receiver
    const creditRes = await fetch(`${WALLET_SERVICE_URL}/v1/billeteras/credito`, {
      method: "POST",
      headers: internalHeaders,
      body: JSON.stringify({ userId: receiverId, amount }),
    });
    if (!creditRes.ok) {
      await fetch(`${WALLET_SERVICE_URL}/v1/billeteras/credito`, {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ userId: senderId, amount }),
      });
      throw { message: "Failed to credit receiver wallet" };
    }

    // 5. Record transaction
    const tx = await client.query(
      `INSERT INTO transaccion
       ("senderId", "receiverId", "amount", "currency", "type", "status", "description", "idempotencyKey", "completedAt")
       VALUES ($1, $2, $3, $4, 'PAYMENT_QR', 'COMPLETED', $5, $6, NOW())
       RETURNING *`,
      [senderId, receiverId, amount, currency, input.description ?? qrData.description ?? null, input.idempotencyKey]
    );
    const row = tx.rows[0];

    await publishTransactionCompleted({
      txId: row.txId, senderId: row.senderId, receiverId: row.receiverId,
      amount: row.amount.toString(), currency: row.currency, transactionType: row.type,
    });

    return {
      transaction: {
        txId: row.txId, senderId: row.senderId, receiverId: row.receiverId,
        amount: row.amount.toString(), currency: row.currency, type: row.type,
        status: row.status, description: row.description,
        createdAt: row.createdAt, completedAt: row.completedAt,
      },
    };
  } finally {
    client.release();
  }
}
