export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: number;
}
