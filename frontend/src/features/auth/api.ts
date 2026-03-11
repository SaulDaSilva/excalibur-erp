import { apiGet, apiPost, setCsrfToken } from "../../lib/api";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
};

export type CsrfResponse = {
  csrfToken: string;
};

export type LogoutResponse = {
  detail: string;
};

export function getCsrf(): Promise<CsrfResponse> {
  return apiGet<CsrfResponse>("/api/auth/csrf/").then((response) => {
    setCsrfToken(response.csrfToken);
    return response;
  });
}

export function login(username: string, password: string): Promise<AuthUser> {
  return apiPost<AuthUser>("/api/auth/login/", { username, password });
}

export function me(): Promise<AuthUser> {
  return apiGet<AuthUser>("/api/auth/me/");
}

export function logout(): Promise<LogoutResponse> {
  return apiPost<LogoutResponse>("/api/auth/logout/").finally(() => {
    setCsrfToken(null);
  });
}
