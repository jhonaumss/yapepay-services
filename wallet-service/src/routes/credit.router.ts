import { Router, Request, Response } from "express";
import {
  submitCreditApplication,
  getCreditEvaluation,
  listCreditEvaluations,
} from "../handlers/creditProxy.handler";
import { requireRole } from "../middleware/role.middleware";

export const creditRouter = Router();

// POST /v1/creditos — proxied to credit-service
creditRouter.post("/creditos", requireRole("regular_user"), async (req: Request, res: Response) => {
  const { status, body } = await submitCreditApplication(req.headers.authorization!, req.body);
  res.status(status).json(body);
});

// GET /v1/creditos/:evaluationId — proxied to credit-service
creditRouter.get(
  "/creditos/:evaluationId",
  requireRole("regular_user"),
  async (req: Request, res: Response) => {
    const { status, body } = await getCreditEvaluation(
      req.headers.authorization!,
      String(req.params.evaluationId)
    );
    res.status(status).json(body);
  }
);

// GET /v1/creditos — proxied to credit-service
creditRouter.get("/creditos", requireRole("regular_user"), async (req: Request, res: Response) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === "string") params.set(key, value);
  }
  const { status, body } = await listCreditEvaluations(req.headers.authorization!, params.toString());
  res.status(status).json(body);
});
