import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5433"),
  user: process.env.DB_USER || "yapepay",
  password: process.env.DB_PASSWORD || "yapepay123",
  database: process.env.DB_NAME || "yapepay_users",
  max: 10,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error", err);
});