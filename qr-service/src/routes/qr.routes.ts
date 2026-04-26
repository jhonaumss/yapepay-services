import { Router, Request, Response } from "express";
import {
  GenerateQROperationServerInput,
  GetQROperationServerInput,
} from "@yapepay/service-ssdk";
import { generateQRHandler } from "../handlers/generateQR.handler";
import { getQRHandler } from "../handlers/getQR.handler";

export const qrRouter = Router();

// POST /v1/qr
qrRouter.post("/qr", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const input: GenerateQROperationServerInput = {
      amount: req.body.amount,
      currency: req.body.currency,
      description: req.body.description,
      ttlMinutes: req.body.ttlMinutes,
    };
    const result = await generateQRHandler(userId, input);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// GET /v1/qr/:qrId
qrRouter.get("/qr/:qrId", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const input: GetQROperationServerInput = {
      qrId: req.params.qrId?.toString() || "",
    };
    const result = await getQRHandler(userId, input);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});