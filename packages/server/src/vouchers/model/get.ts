import { pool } from "../../db.js";
import type { Voucher } from "@takehome/common";

export async function getVouchersByCaseId(caseId: string): Promise<Voucher[]> {
  const { rows } = await pool.query(
    "SELECT * FROM vouchers WHERE case_id = $1 ORDER BY date",
    [caseId],
  );
  return rows;
}
