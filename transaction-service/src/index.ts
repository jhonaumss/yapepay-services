import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { transactionRouter } from "./routes/transaction.router";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(authMiddleware);
app.use("/v1", transactionRouter);

app.listen(PORT, () => {
  console.log(`transaction-service running on port ${PORT}`);
});