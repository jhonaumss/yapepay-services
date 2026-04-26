import { Router, Request, Response } from "express";
import {
  CreateTransactionOperationServerInput,
  ListTransactionsOperationServerInput,
  GetTransactionOperationServerInput,
} from "@yapepay/service-ssdk";
import { createTransactionHandler } from "../handlers/createTransaction.handler";
import { listTransactionsHandler } from "../handlers/listTransactions.handler";
import { getTransactionHandler } from "../handlers/getTransaction.handler";

export const transactionRouter = Router();

// POST /v1/transacciones
transactionRouter.post("/transacciones", async (req: Request, res: Response) => {
  const input: CreateTransactionOperationServerInput = {
    receiverPhone: req.body.receiverPhone,
    amount: req.body.amount,
    currency: req.body.currency,
    description: req.body.description,
    idempotencyKey: req.body.idempotencyKey,
  };
  const userId = req.headers["x-user-id"] as string;
  const result = await createTransactionHandler(input, userId);
  res.status(201).json(result);
});

// GET /v1/transacciones
transactionRouter.get("/transacciones", async (req: Request, res: Response) => {
  const input: ListTransactionsOperationServerInput = {
    cursor: req.query.cursor as string | undefined,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
    type: req.query.type as any,
    status: req.query.status as any,
  };
  const userId = req.headers["x-user-id"] as string;
  const result = await listTransactionsHandler(input, userId);
  res.status(200).json(result);
});

// GET /v1/transacciones/:txId
transactionRouter.get("/transacciones/:txId", async (req: Request, res: Response) => {
  const txId = Array.isArray(req.params.txId) ? req.params.txId[0] : req.params.txId;
  const input: GetTransactionOperationServerInput = {
    txId,
  };
  const userId = req.headers["x-user-id"] as string;
  const result = await getTransactionHandler(input, userId);
  res.status(200).json(result);
});