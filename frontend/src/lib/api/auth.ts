import { api, setTokens, clearTokens } from "@/lib/api";
import type { BackendUser, LoginResult, LoginResponse, MfaPendingResponse } from "./types";

export function isMfaPending(r: LoginResult): r is MfaPendingResponse {
  return (r as MfaPendingResponse).requires_mfa === true;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResult> {
    const res = await api.post<LoginResult>("/auth/login", { email, password }, { noAuth: true });
    if (!isMfaPending(res)) {
      setTokens(res.access_token, res.refresh_token);
    }
    return res;
  },

  async verifyMfa(temp_token: string, code: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/mfa/verify", { temp_token, code }, { noAuth: true });
    setTokens(res.access_token, res.refresh_token);
    return res;
  },

  async register(email: string, password: string, role: string, full_name?: string): Promise<BackendUser> {
    return api.post<BackendUser>("/auth/register", { email, password, role, full_name }, { noAuth: true });
  },

  async me(): Promise<BackendUser> {
    return api.get<BackendUser>("/auth/me");
  },

  async verifyMagicLink(token: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>("/auth/magic-link/verify", { token }, { noAuth: true });
    setTokens(res.access_token, res.refresh_token);
    return res;
  },

  logout() {
    clearTokens();
  },
};
