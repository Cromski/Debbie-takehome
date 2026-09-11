import { Router } from "express";
import { createCaseInputSchema, idParamSchema } from "@takehome/common";
import { ZodError } from "zod";
import { createCase } from "./model/create.js";
import { getCaseById, listCases } from "./model/get.js";
import { getVouchersByCaseId } from "../vouchers/model/get.js";
import { calculateCaseStatus } from "../util/CaseStatusCalc.js";

const router = Router();

router.get("/", async (_req, res) => {
  const cases = await listCases();
  res.json(cases);
});

router.post("/", async (req, res) => {
  try {
    const input = createCaseInputSchema.parse(req.body);
    const created = await createCase(input);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Invalid case payload",
        issues: error.issues,
      });
      return;
    }

    throw error;
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const found = await getCaseById(id);
    if (!found) {
      res.status(404).json({ message: "Case not found" });
      return;
    }
    res.json(found);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Invalid case id",
        issues: error.issues,
      });
      return;
    }

    throw error;
  }
});

router.get("/:id/status", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const found = await getCaseById(id);
    if (!found) {
      res.status(404).json({ message: "Case not found" });
      return;
    }

    const vouchers = await getVouchersByCaseId(id);
    const status = calculateCaseStatus(id, vouchers);
    res.json(status);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Invalid case id",
        issues: error.issues,
      });
      return;
    }

    throw error;
  }
});

export default router;
