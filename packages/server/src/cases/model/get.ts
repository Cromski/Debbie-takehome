import { pool } from "../../db.js";
import type { Case } from "@takehome/common";

export async function listCases(): Promise<Case[]> {
  const { rows } = await pool.query(
    "SELECT * FROM cases ORDER BY created_at",
  );
  return rows;
}

export async function getCaseById(id: string): Promise<Case | null> {
  const { rows } = await pool.query(
    "SELECT * FROM cases WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}
