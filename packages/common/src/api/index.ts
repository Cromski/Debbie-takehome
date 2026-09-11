export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
}

import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid(),
});

export interface ApiError {
  message: string;
  code: number;
}
