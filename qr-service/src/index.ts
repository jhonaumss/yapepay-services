import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import { qrRouter } from "./routes/qr.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { useQRHandler } from "./handlers/useQR.handler";

export const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Internal endpoint — called by transaction-service, no user auth required
app.patch("/v1/qr/:qrId/use", async (req: Request, res: Response) => {
  try {
    const qrId = Array.isArray(req.params.qrId) ? req.params.qrId[0] : req.params.qrId;
    const result = await useQRHandler(qrId);
    res.status(200).json(result);
  } catch (err: any) {
    const status = err.message === "QR not found" ? 404 : 409;
    res.status(status).json({ message: err.message });
  }
});

app.use(authMiddleware);
app.use("/v1", qrRouter);

if (!process.env.LAMBDA_TASK_ROOT) {
  app.listen(PORT, () => {
    console.log(`qr-service running on port ${PORT}`);
  });
}
