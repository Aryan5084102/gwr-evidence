/**
 * Thin fetch wrapper for the GWR backend.
 *
 * - Base URL from VITE_API_URL or http://localhost:8000/api/v1
 * - Auto-attaches Authorization: Bearer <access_token> from localStorage
 * - On 401, transparently tries the refresh token once, then retries
 * - Throws ApiError with status + body on non-2xx
 */

const DEFAULT_BASE = "http://localhost:8000/api/v1";
const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
export const API_BASE: string = (env.VITE_API_URL || DEFAULT_BASE).replace(/\/$/, "");

const ACCESS_KEY = "gwr_access_token";
const REFRESH_KEY = "gwr_refresh_token";

export function getAccessToken(): string | null {
  try { return localStorage.getItem(ACCESS_KEY); } catch { return null; }
}
export function getRefreshToken(): string | null {
  try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}
export function setTokens(access: string | null, refresh: string | null) {
  try {
    if (access) localStorage.setItem(ACCESS_KEY, access);
    else localStorage.removeItem(ACCESS_KEY);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    else localStorage.removeItem(REFRESH_KEY);
  } catch { /* noop */ }
}
export function clearTokens() { setTokens(null, null); }

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  /** Skip Authorization header (use for login/register). */
  noAuth?: boolean;
  /** Internal: prevent infinite refresh loops. */
  _retried?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  if (!query) return base;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `${base}?${qs}` : base;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data?.access_token) return false;
    setTokens(data.access_token, data.refresh_token ?? refresh);
    return true;
  } catch {
    return false;
  }
}

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
  };
  if (!opts.noAuth) {
    const tok = getAccessToken();
    if (tok) headers.Authorization = `Bearer ${tok}`;
  }

  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers,
  };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);

  const url = buildUrl(path, opts.query);
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new ApiError(0, "Network error — is the backend running?", null);
  }

  if (res.status === 401 && !opts.noAuth && !opts._retried) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, { ...opts, _retried: true });
    clearTokens();
    throw new ApiError(401, "Session expired. Please sign in again.", null);
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }

  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "detail" in (body as Record<string, unknown>)
        ? String((body as { detail: unknown }).detail)
        : `Request failed (${res.status})`);
    throw new ApiError(res.status, msg, body);
  }

  return body as T;
}

export const api = {
  get: <T = unknown>(path: string, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "POST", body }),
  patch: <T = unknown>(path: string, body?: unknown, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "PATCH", body }),
  put: <T = unknown>(path: string, body?: unknown, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "PUT", body }),
  delete: <T = unknown>(path: string, opts: Omit<RequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};
