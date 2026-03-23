import type { ApiEnvelope, ApiFieldError } from "@/src/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details: ApiFieldError[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError<T>(
  status: number,
  payload: Partial<ApiEnvelope<T>> | null
): ApiError {
  const details = Array.isArray(
    (payload as { data?: { errors?: ApiFieldError[] } } | null)?.data?.errors
  )
    ? ((payload as { data?: { errors?: ApiFieldError[] } }).data?.errors ?? [])
    : [];
  const code =
    details[0]?.code ||
    (typeof payload?.code === "number" ? String(payload.code) : undefined);
  const message =
    payload?.message ||
    (status === 401 ? "인증이 만료되었습니다." : "요청 처리에 실패했습니다.");

  return new ApiError(message, status, code, details);
}
