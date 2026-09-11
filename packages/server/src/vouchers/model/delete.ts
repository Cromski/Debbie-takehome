import { pool } from "../../db.js";
import type { Voucher } from "@takehome/common";

export async function deleteVoucher(id: string): Promise<Voucher | null> {
  const result = await pool.query<Voucher>(
    `
    DELETE FROM vouchers
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0] ?? null;
}