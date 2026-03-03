import { pool } from "../db.js";

async function seed() {
  // Clear existing data
  await pool.query("DELETE FROM vouchers");
  await pool.query("DELETE FROM cases");

  // Cases
  const { rows: cases } = await pool.query(`
    INSERT INTO cases (reference, debtor_name, created_at) VALUES
      ('SAG-001', 'Anders Jensen', '2024-01-15'),
      ('SAG-002', 'Maria Nielsen', '2024-03-01'),
      ('SAG-003', 'Peter Hansen', '2024-06-10')
    RETURNING id, reference
  `);

  const caseMap = Object.fromEntries(
    cases.map((c: { id: string; reference: string }) => [c.reference, c.id]),
  );

  // Principal vouchers
  const { rows: principals } = await pool.query(
    `
    INSERT INTO vouchers (case_id, type_id, amount, date) VALUES
      ($1, 'principal', 15000, '2024-01-15'),
      ($2, 'principal', 8500, '2024-03-01'),
      ($3, 'principal', 25000, '2024-06-10')
    RETURNING id, case_id
  `,
    [caseMap["SAG-001"], caseMap["SAG-002"], caseMap["SAG-003"]],
  );

  const principalMap = Object.fromEntries(
    principals.map((p: { id: string; case_id: string }) => [p.case_id, p.id]),
  );

  // Interest and payment vouchers
  await pool.query(
    `
    INSERT INTO vouchers (case_id, type_id, amount, annual_interest_rate, reference_voucher_id, date) VALUES
      ($1, 'interest', 0, 8.5, $3, '2024-02-15'),
      ($1, 'payment', -2000, NULL, NULL, '2024-02-15'),
      ($1, 'payment', -2000, NULL, NULL, '2024-03-15'),

      ($2, 'interest', 0, 10.0, $4, '2024-04-01'),
      ($2, 'payment', -1000, NULL, NULL, '2024-04-01')
  `,
    [
      caseMap["SAG-001"],
      caseMap["SAG-002"],
      principalMap[caseMap["SAG-001"]],
      principalMap[caseMap["SAG-002"]],
    ],
  );

  await pool.end();
  console.log("Seeded 3 cases with vouchers");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
