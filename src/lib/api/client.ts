import { env } from "@/src/config/env";
import { getAuthState } from "@/src/lib/auth/store";
import { ApiError, toApiError } from "@/src/lib/api/errors";
import type { ApiEnvelope } from "@/src/types/api";
import { buildQueryString } from "@/src/utils/query";

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions<TBody = unknown> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue | QueryValue[]>;
  body?: TBody;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  retryOnAuth?: boolean;
};

let refreshHandler: (() => Promise<boolean>) | null = null;

export function registerAuthRefreshHandler(handler: () => Promise<boolean>) {
  refreshHandler = handler;
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "code" in value &&
    "data" in value
  );
}

async function parseResponse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as T;
}

function buildRequestUrl(path: string, query?: Record<string, QueryValue | QueryValue[]>) {
  return `${env.apiBaseUrl}${path}${buildQueryString(query)}`;
}

async function sendRequest<TResponse, TBody>(
  path: string,
  options: ApiRequestOptions<TBody>,
  attemptedRefresh: boolean
): Promise<TResponse> {
  const { session } = getAuthState();
  const headers = new Headers(options.headers);
  const method = options.method ?? "GET";

  if (!options.skipAuth && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildRequestUrl(path, options.query), {
    method,
    headers,
    body,
    credentials: "include"
  });

  if (
    response.status === 401 &&
    !options.skipAuth &&
    options.retryOnAuth !== false &&
    !attemptedRefresh &&
    refreshHandler
  ) {
    const refreshed = await refreshHandler();
    if (refreshed) {
      return sendRequest<TResponse, TBody>(path, options, true);
    }
  }

  const payload = await parseResponse<ApiEnvelope<TResponse> | Record<string, unknown>>(response);

  if (!response.ok) {
    throw toApiError(response.status, payload as Partial<ApiEnvelope<TResponse>> | null);
  }

  if (payload && isApiEnvelope<TResponse>(payload)) {
    if (payload.status !== "success") {
      throw toApiError(response.status, payload);
    }
    return payload.data;
  }

  if (payload === null) {
    return undefined as TResponse;
  }

  return payload as TResponse;
}

export async function requestApi<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {}
): Promise<TResponse> {
  try {
    return await sendRequest<TResponse, TBody>(path, options, false);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("네트워크 오류로 요청에 실패했습니다.", 0);
  }
}

export function buildApiUrl(
  path: string,
  query?: Record<string, QueryValue | QueryValue[]>
) {
  return buildRequestUrl(path, query);
}
