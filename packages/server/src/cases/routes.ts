import { Router } from "express";
import { createCase } from "./model/create.js";
import { getCaseById, listCases } from "./model/get.js";

const router = Router();

router.get("/", async (_req, res) => {
  const cases = await listCases();
  res.json(cases);
});

router.post("/", async (req, res) => {
  const created = await createCase(req.body);
  res.status(201).json(created);
});

router.get("/:id", async (req, res) => {
  const found = await getCaseById(req.params.id);
  if (!found) {
    res.status(404).json({ message: "Case not found" });
    return;
  }
  res.json(found);
});

export default router;
