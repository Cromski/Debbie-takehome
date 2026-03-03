import type { Pool } from "pg";

export const name = "001_initial";

export async function up(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cases (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      reference   text NOT NULL UNIQUE,
      debtor_name text NOT NULL,
      created_at  date NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id              uuid NOT NULL REFERENCES cases(id),
      type_id              text NOT NULL,
      amount               numeric NOT NULL,
      annual_interest_rate numeric,
      reference_voucher_id uuid REFERENCES vouchers(id),
      date                 date NOT NULL,
      created_at           timestamp NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_vouchers_case_id ON vouchers(case_id)
  `);
}
