import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { userRouter } from "./routes/user.router";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
// Ruta pública — registro no requiere token
app.post("/v1/usuarios/registro", async (req, res) => {
  const { registerHandler } = await import("./handlers/register.handler");
  try {
    const result = await registerHandler(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/v1/usuarios/portelefono", async (req, res) => {
  const { getUserByPhoneHandler } = await import("./handlers/getUserByPhone.handler");
  try {
    const phone = req.query.numero as string;
    const result = await getUserByPhoneHandler(phone);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});
// Rutas protegidas
app.use(authMiddleware);
app.use("/v1", userRouter);

app.listen(PORT, () => {
  console.log(`user-service running on port ${PORT}`);
});