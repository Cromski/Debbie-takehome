import type { Pool } from "pg";

export const name = "002_voucher_constraints";

export async function up(pool: Pool) {
  await pool.query(`
    ALTER TABLE vouchers
      DROP CONSTRAINT IF EXISTS vouchers_type_id_chk,
      DROP CONSTRAINT IF EXISTS vouchers_interest_fields_chk,
      DROP CONSTRAINT IF EXISTS vouchers_amount_sign_chk,
      DROP CONSTRAINT IF EXISTS vouchers_rate_range_chk,
      DROP CONSTRAINT IF EXISTS vouchers_no_self_ref_chk,
      ADD CONSTRAINT vouchers_type_id_chk
        CHECK (type_id IN ('principal', 'interest', 'payment')) NOT VALID,
      ADD CONSTRAINT vouchers_interest_fields_chk
        CHECK (
          (
            type_id = 'interest'
            AND annual_interest_rate IS NOT NULL
            AND reference_voucher_id IS NOT NULL
          )
          OR
          (
            type_id IN ('principal', 'payment')
            AND annual_interest_rate IS NULL
            AND reference_voucher_id IS NULL
          )
        ) NOT VALID,
      ADD CONSTRAINT vouchers_amount_sign_chk
        CHECK (
          (type_id = 'principal' AND amount > 0)
          OR (type_id = 'payment' AND amount < 0)
          OR (type_id = 'interest' AND amount = 0)
        ) NOT VALID,
      ADD CONSTRAINT vouchers_rate_range_chk
        CHECK (
          annual_interest_rate IS NULL
          OR (annual_interest_rate > 0 AND annual_interest_rate <= 100)
        ) NOT VALID,
      ADD CONSTRAINT vouchers_no_self_ref_chk
        CHECK (reference_voucher_id IS NULL OR reference_voucher_id <> id) NOT VALID
  `);
}