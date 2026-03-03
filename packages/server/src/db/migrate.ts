import { pool } from "../db.js";
import { migrations } from "./migrations/index.js";

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      name text PRIMARY KEY,
      applied_at timestamp NOT NULL DEFAULT now()
    )
  `);

  for (const { name, up } of migrations) {
    const { rows } = await pool.query(
      "SELECT 1 FROM migrations WHERE name = $1",
      [name],
    );
    if (rows.length > 0) {
      console.log(`Skipping ${name} (already applied)`);
      continue;
    }

    await up(pool);
    await pool.query("INSERT INTO migrations (name) VALUES ($1)", [name]);
    console.log(`Applied ${name}`);
  }

  await pool.end();
  console.log("Migrations complete");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
