import { Router, Request, Response } from "express";
import {
  GetMyWalletOperationServerInput,
} from "@yapepay/service-ssdk";
import { getMyWalletHandler } from "../handlers/getMyWallet.handler";
import { createRechargeHandler } from "../handlers/createRecharge.handler";
import { requireRole } from "../middleware/role.middleware";

export const walletRouter = Router();

// GET /v1/billeteras/me — regular users only
walletRouter.get("/billeteras/me", requireRole('regular_user'), async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const input: GetMyWalletOperationServerInput = {};
    const result = await getMyWalletHandler(userId, input);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});

// POST /v1/recargas — cashier users only
walletRouter.post("/recargas", requireRole('cashier_user'), async (req: Request, res: Response) => {
  try {
    const phoneNumber = req.body.phoneNumber as string;
    if (!phoneNumber) {
      res.status(400).json({ message: "phoneNumber is required" });
      return;
    }
    const result = await createRechargeHandler(phoneNumber, {
      amount: req.body.amount,
      idempotencyKey: req.body.idempotencyKey,
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});