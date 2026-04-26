import { pool } from "../db/client";
import {
  CreateTransactionOperationServerInput,
  CreateTransactionOperationServerOutput,
} from "@yapepay/service-ssdk";
import { publishTransactionCompleted } from "../sqs/producer";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || "http://localhost:3002";

export async function createTransactionHandler(
  input: CreateTransactionOperationServerInput,
  senderId: string
): Promise<CreateTransactionOperationServerOutput> {
  const client = await pool.connect();
  try {
    // 1. Verificar idempotencia
    const existing = await client.query(
      `SELECT * FROM transaccion WHERE "idempotencyKey" = $1`,
      [input.idempotencyKey]
    );
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return {
        transaction: {
          txId: row.txId,
          senderId: row.senderId,
          receiverId: row.receiverId,
          amount: row.amount.toString(),
          currency: row.currency,
          type: row.type,
          status: row.status,
          description: row.description,
          createdAt: row.createdAt,
          completedAt: row.completedAt,
        },
      };
    }
    // 2. Resolver receiverPhone → receiverId via user-service
    const userRes = await fetch(
      `${USER_SERVICE_URL}/v1/usuarios/portelefono?numero=${input.receiverPhone}`
    );
    if (!userRes.ok) {
      throw { message: "Receiver not found", code: "RECEIVER_NOT_FOUND" };
    }
    const userData = await userRes.json() as { user: { userId: string } };
    const receiverId = userData.user.userId;

    // 3. Debitar billetera del sender via wallet-service
    const debitRes = await fetch(`${WALLET_SERVICE_URL}/v1/billeteras/debito`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: senderId,
        amount: input.amount ? parseFloat(input.amount) : 0,
      }),
    });
    console.log(debitRes);
    if (!debitRes.ok) {
      const err = await debitRes.json() as { message: string; };
      throw { code: "INSUFFICIENT_FUNDS", ...err };
    }
    console.log('Debit successful');
    // 4. Acreditar billetera del receiver via wallet-service
    const creditRes = await fetch(`${WALLET_SERVICE_URL}/v1/billeteras/credito`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: receiverId,
        amount: input.amount ? parseFloat(input.amount) : 0,
      }),
    });
    if (!creditRes.ok) {
      // Revertir débito si falla el crédito
      await fetch(`${WALLET_SERVICE_URL}/v1/billeteras/credito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: senderId,
          amount: input.amount ? parseFloat(input.amount) : 0,
        }),
      });
      throw { message: "Failed to credit receiver wallet" };
    }
    console.log('Credit successful');

    // 5. Registrar transacción
    const tx = await client.query(
      `INSERT INTO transaccion
       ("senderId", "receiverId", "amount", "currency", "type", "status", "description", "idempotencyKey", "completedAt")
       VALUES ($1, $2, $3, $4, 'P2P_TRANSFER', 'COMPLETED', $5, $6, NOW())
       RETURNING *`,
      [senderId, receiverId, input.amount ? parseFloat(input.amount) : 0, input.currency ?? "BOB", input.description ?? null, input.idempotencyKey]
    );
    const row = tx.rows[0];
    await publishTransactionCompleted({
        txId: row.txId,
        senderId: row.senderId,
        receiverId: row.receiverId,
        amount: row.amount.toString(),
        currency: row.currency,
    });
    return {
      transaction: {
        txId: row.txId,
        senderId: row.senderId,
        receiverId: row.receiverId,
        amount: row.amount.toString(),
        currency: row.currency,
        type: row.type,
        status: row.status,
        description: row.description,
        createdAt: row.createdAt,
        completedAt: row.completedAt,
      },
    };
  } finally {
    client.release();
  }
}