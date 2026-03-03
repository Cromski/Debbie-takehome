import { Router, type Request } from "express";
import { VoucherType } from "@takehome/common";
import { createVoucher } from "./model/create.js";
import { getVouchersByCaseId } from "./model/get.js";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request<{ id: string }>, res) => {
  const vouchers = await getVouchersByCaseId(req.params.id);
  res.json(vouchers);
});

router.post("/", async (req: Request<{ id: string }>, res) => {
  const { type_id, annual_interest_rate, reference_voucher_id } = req.body;
  const isInterest = type_id === VoucherType.Interest;

  if (!isInterest && annual_interest_rate != null) {
    res.status(400).json({ message: "annual_interest_rate is only allowed on interest vouchers" });
    return;
  }

  if (!isInterest && reference_voucher_id != null) {
    res.status(400).json({ message: "reference_voucher_id is only allowed on interest vouchers" });
    return;
  }

  const created = await createVoucher(req.params.id, req.body);
  res.status(201).json(created);
});

export default router;
