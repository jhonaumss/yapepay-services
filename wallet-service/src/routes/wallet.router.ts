import { Router, Request, Response } from "express";
import {
  GetMyWalletOperationServerInput,
  CreateRechargeOperationServerInput,
} from "@yapepay/service-ssdk";
import { getMyWalletHandler } from "../handlers/getMyWallet.handler";
import { createRechargeHandler } from "../handlers/createRecharge.handler";

export const walletRouter = Router();

// GET /v1/billeteras/me
walletRouter.get("/billeteras/me", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const input: GetMyWalletOperationServerInput = {};
    const result = await getMyWalletHandler(userId, input);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});

// POST /v1/recargas
walletRouter.post("/recargas", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const input: CreateRechargeOperationServerInput = {
      bankAccountId: req.body.bankAccountId,
      amount: req.body.amount,
      idempotencyKey: req.body.idempotencyKey,
    };
    const result = await createRechargeHandler(userId, input);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});