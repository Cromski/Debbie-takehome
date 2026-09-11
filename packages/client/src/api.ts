const BASE = "/api";

export type ApiIssue = {
  path?: Array<string | number>;
  message: string;
};

export type ApiErrorBody = {
  message: string;
  issues?: ApiIssue[];
};

export class ApiRequestError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, message: string, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    throw new ApiRequestError(
      res.status,
      body?.message ?? `${res.status} ${res.statusText}`,
      body,
    );
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
