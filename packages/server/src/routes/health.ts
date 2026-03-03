import { Router } from "express";
import type { HealthResponse } from "@takehome/common";
import { pool } from "../db.js";

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    const response: HealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
    res.json(response);
  } catch {
    const response: HealthResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
    };
    res.status(503).json(response);
  }
});

export default router;
