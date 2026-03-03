import { pool } from "../../db.js";
import type { Voucher, CreateVoucherInput } from "@takehome/common";

export async function createVoucher(
  caseId: string,
  input: CreateVoucherInput,
): Promise<Voucher> {
  const { rows } = await pool.query(
    `INSERT INTO vouchers (case_id, type_id, amount, annual_interest_rate, reference_voucher_id, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      caseId,
      input.type_id,
      input.amount,
      input.annual_interest_rate ?? null,
      input.reference_voucher_id ?? null,
      input.date,
    ],
  );
  return rows[0];
}
