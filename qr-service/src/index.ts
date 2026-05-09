import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { qrRouter } from "./routes/qr.routes";
import { authMiddleware } from "./middleware/auth.middleware";

export const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(authMiddleware);
app.use("/v1", qrRouter);

// Skip HTTP server in Lambda (LAMBDA_TASK_ROOT is set by the runtime)
if (!process.env.LAMBDA_TASK_ROOT) {
  app.listen(PORT, () => {
    console.log(`qr-service running on port ${PORT}`);
  });
}