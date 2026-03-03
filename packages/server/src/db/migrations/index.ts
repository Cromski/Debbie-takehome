import type { Pool } from "pg";
import * as m001 from "./001_initial.js";

export interface Migration {
  name: string;
  up: (pool: Pool) => Promise<void>;
}

export const migrations: Migration[] = [m001];
