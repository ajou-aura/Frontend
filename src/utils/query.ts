type QueryValue = string | number | boolean | null | undefined;

export function buildQueryString(
  query?: Record<string, QueryValue | QueryValue[]>
): string {
  if (!query) {
    return "";
  }

  const parts: string[] = [];

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }

      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(
          value.filter(Boolean).join(",")
        )}`
      );
      return;
    }

    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });

  return parts.length > 0 ? `?${parts.join("&")}` : "";
}
