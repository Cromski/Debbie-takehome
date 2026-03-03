import { pool } from "../../db.js";
import type { Case, CreateCaseInput } from "@takehome/common";

export async function createCase(input: CreateCaseInput): Promise<Case> {
  const { rows } = await pool.query(
    `INSERT INTO cases (reference, debtor_name, created_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.reference, input.debtor_name, input.created_at],
  );
  return rows[0];
}
