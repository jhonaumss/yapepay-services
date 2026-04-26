import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { qrRouter } from "./routes/qr.routes";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(authMiddleware);
app.use("/v1", qrRouter);

app.listen(PORT, () => {
  console.log(`qr-service running on port ${PORT}`);
});