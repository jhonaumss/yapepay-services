import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { walletRouter } from "./routes/wallet.router";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Rutas internas sin auth
app.post("/v1/billeteras", async (req, res) => {
  const { createWalletHandler } = await import("./handlers/createWallet.handler");
  try {
    const result = await createWalletHandler(req.body.userId);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// POST /v1/billeteras/debito — interno
app.post("/v1/billeteras/debito", async (req , res) => {
  const {debitWalletHandler} = await import("./handlers/debitWallet.handler");
  try {
    const result = await debitWalletHandler(req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(422).json({ message: err.message, ...err });
  }
});

// POST /v1/billeteras/credito — interno
app.post("/v1/billeteras/credito", async (req, res) => {
  const {creditWalletHandler} = await import("./handlers/creditWallet.handler");
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