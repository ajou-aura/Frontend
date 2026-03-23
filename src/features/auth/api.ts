import { AUTH_ROUTES } from "@/src/lib/api/routes";
import { buildApiUrl, requestApi } from "@/src/lib/api/client";
import type { AppExchangeResponse, RefreshResponse } from "@/src/types/auth";

export function getGoogleAuthUrl(mode: "app" | "web") {
  return buildApiUrl(AUTH_ROUTES.google, { mode });
}

export async function exchangeAppTicket(code: string) {
  return requestApi<AppExchangeResponse, { code: string }>(AUTH_ROUTES.appExchange, {
    method: "POST",
    body: { code },
    skipAuth: true,
    retryOnAuth: false
  });
}

export async function refreshAuthTokens(refreshToken?: string | null) {
  return requestApi<RefreshResponse, { refreshToken: string }>(AUTH_ROUTES.refresh, {
    method: "POST",
    body: refreshToken ? { refreshToken } : undefined,
    skipAuth: true,
    retryOnAuth: false
  });
}

export async function logoutFromBackend(refreshToken?: string | null) {
  return requestApi<void, { refreshToken: string }>(AUTH_ROUTES.logout, {
    method: "POST",
    body: refreshToken ? { refreshToken } : undefined,
    skipAuth: true,
    retryOnAuth: false
  });
}
