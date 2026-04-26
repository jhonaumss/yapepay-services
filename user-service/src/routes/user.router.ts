import { Router, Request, Response } from "express";
import {
  GetCurrentUserOperationServerInput,
  UpdateCurrentUserOperationServerInput,
} from "@yapepay/service-ssdk";
import { getCurrentUserHandler } from "../handlers/getCurrentUser.handler";
import { updateCurrentUserHandler } from "../handlers/updateCurrentUser.handler";
import { getUserByPhoneHandler } from "../handlers/getUserByPhone.handler";

export const userRouter = Router();

// GET /v1/usuarios/me
userRouter.get("/usuarios/me", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const input: GetCurrentUserOperationServerInput = {};
    const result = await getCurrentUserHandler(userId, input);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});

// PATCH /v1/usuarios/me
userRouter.patch("/usuarios/me", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const input: UpdateCurrentUserOperationServerInput = { updates: req.body.updates };
    const result = await updateCurrentUserHandler(userId, input);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});