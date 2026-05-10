import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { walletRouter } from "./routes/wallet.router";
import { authMiddleware } from "./middleware/auth.middleware";
import { requireInternalKey } from "./middleware/role.middleware";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Internal routes — validated by shared key, no user JWT required
app.post("/v1/billeteras", requireInternalKey, async (req, res) => {
  const { createWalletHandler } = await import("./handlers/createWallet.handler");
  try {
    const result = await createWalletHandler(req.body.userId);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/v1/billeteras/debito", requireInternalKey, async (req, res) => {
  const { debitWalletHandler } = await import("./handlers/debitWallet.handler");
  try {
    const result = await debitWalletHandler(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(422).json({ message: err.message, ...err });
  }
});

app.post("/v1/billeteras/credito", requireInternalKey, async (req, res) => {
  const { creditWalletHandler } = await import("./handlers/creditWallet.handler");
  try {
    const result = await creditWalletHandler(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Rutas protegidas
app.use(authMiddleware);
app.use("/v1", walletRouter);

app.listen(PORT, () => {
  console.log(`wallet-service running on port ${PORT}`);
});