import { Router, type Request } from "express";
import { createVoucherInputSchema, idParamSchema } from "@takehome/common";
import { deleteVoucher } from "./model/delete.js";
import { ZodError } from "zod";
import { createVoucher } from "./model/create.js";
import { getVouchersByCaseId } from "./model/get.js";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const vouchers = await getVouchersByCaseId(id);
    res.json(vouchers);
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

router.post("/", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = createVoucherInputSchema.parse(req.body);
    const created = await createVoucher(id, input);
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Invalid voucher request",
        issues: error.issues,
      });
      return;
    }

    throw error;
  }
});

router.delete("/:voucherId", async (req, res) => {
  try {
    const { id: voucherId } = idParamSchema.parse({ id: req.params.voucherId });
    const deleted = await deleteVoucher(voucherId);
    if (!deleted) {
      res.status(404).json({ message: "Voucher not found" });
      return;
    }
    res.json(deleted);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Invalid voucher id",
        issues: error.issues,
      });
      return;
    }

    throw error;
  }
});

export default router;
