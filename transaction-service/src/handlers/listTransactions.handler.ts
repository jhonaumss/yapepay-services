import { pool } from "../db/client";
import {
  ListTransactionsOperationServerInput,
  ListTransactionsOperationServerOutput,
} from "@yapepay/service-ssdk";

interface CursorPayload {
  createdAt: string;
  txId: string;
}

function encodeCursor(createdAt: Date, txId: string): string {
  return Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), txId })).toString("base64");
}

function decodeCursor(cursor: string): CursorPayload {
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
}

export async function listTransactionsHandler(
  input: ListTransactionsOperationServerInput,
  userId: string
): Promise<ListTransactionsOperationServerOutput> {
  const pageSize = input.pageSize ?? 20;

  // Base filters (used for both the count and the page query)
  const baseConditions: string[] = [`("senderId" = $1 OR "receiverId" = $1)`];
  const baseParams: unknown[] = [userId];
  let p = 2;

  if (input.type) {
    baseConditions.push(`"type" = $${p++}`);
    baseParams.push(input.type);
  }
  if (input.status) {
    baseConditions.push(`"status" = $${p++}`);
    baseParams.push(input.status);
  }
  if (input.fromDate) {
    baseConditions.push(`"createdAt" >= $${p++}`);
    baseParams.push(input.fromDate);
  }
  if (input.toDate) {
    baseConditions.push(`"createdAt" <= $${p++}`);
    baseParams.push(input.toDate);
  }

  // Cursor condition appended only for the page query
  const pageConditions = [...baseConditions];
  const pageParams = [...baseParams];

  if (input.cursor) {
    const { createdAt, txId } = decodeCursor(input.cursor);
    pageConditions.push(`("createdAt", "txId") < ($${p++}, $${p++})`);
    pageParams.push(createdAt, txId);
  }

  const baseWhere = baseConditions.join(" AND ");
  const pageWhere = pageConditions.join(" AND ");

  const [rowsResult, countResult] = await Promise.all([
    pool.query(
      `SELECT * FROM transaccion
       WHERE ${pageWhere}
       ORDER BY "createdAt" DESC, "txId" DESC
       LIMIT $${p}`,
      [...pageParams, pageSize + 1]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total FROM transaccion WHERE ${baseWhere}`,
      baseParams
    ),
  ]);

  const rows = rowsResult.rows;
  const hasMore = rows.length > pageSize;
  if (hasMore) rows.pop();

  const nextCursor = hasMore
    ? encodeCursor(rows[rows.length - 1].createdAt, rows[rows.length - 1].txId)
    : undefined;

  return {
    transactions: rows.map(row => ({
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
    })),
    nextCursor,
    total: countResult.rows[0].total,
  };
}
