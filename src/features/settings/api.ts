import {
  KEYWORD_ROUTES,
  SUBSCRIPTION_ROUTES,
  USER_ROUTES
} from "@/src/lib/api/routes";
import { requestApi } from "@/src/lib/api/client";
import type { UserProfile } from "@/src/types/auth";
import type { Keyword, SubscriptionMode } from "@/src/types/settings";

export async function fetchCurrentUser() {
  return requestApi<UserProfile>(USER_ROUTES.info, {
    method: "GET"
  });
}

export async function listDepartments() {
  return requestApi<string[]>(USER_ROUTES.departments, {
    method: "GET"
  });
}

export async function addDepartment(department: string) {
  return requestApi<void, { department: string }>(USER_ROUTES.departments, {
    method: "POST",
    body: { department }
  });
}

export async function removeDepartment(department: string) {
  return requestApi<void, { department: string }>(USER_ROUTES.departments, {
    method: "DELETE",
    body: { department }
  });
}

export async function listKeywords() {
  return requestApi<Keyword[]>(KEYWORD_ROUTES.list, {
    method: "GET"
  });
}

export async function listGlobalKeywords() {
  return requestApi<Keyword[]>(KEYWORD_ROUTES.global, {
    method: "GET"
  });
}

export async function addKeyword(phrase: string) {
  return requestApi<Keyword>(KEYWORD_ROUTES.list, {
    method: "POST",
    query: { phrase }
  });
}

export async function removeKeyword(id: number) {
  return requestApi<void>(`${KEYWORD_ROUTES.list}/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export async function getTypeMode(type: string) {
  return requestApi<SubscriptionMode>(`${SUBSCRIPTION_ROUTES.base}/${encodeURIComponent(type)}`, {
    method: "GET"
  });
}

export async function setTypeMode(type: string, mode: Exclude<SubscriptionMode, null>) {
  return requestApi<void>(
    `${SUBSCRIPTION_ROUTES.base}/${encodeURIComponent(type)}/mode`,
    {
      method: "POST",
      query: { value: mode }
    }
  );
}

export async function listKeywordSubscriptions(type: string) {
  return requestApi<number[]>(
    `${SUBSCRIPTION_ROUTES.base}/${encodeURIComponent(type)}/keywords`,
    {
      method: "GET"
    }
  );
}

export async function subscribeKeyword(type: string, keywordId: number) {
  return requestApi<void>(
    `${SUBSCRIPTION_ROUTES.base}/${encodeURIComponent(type)}/keywords`,
    {
      method: "POST",
      query: { keywordId }
    }
  );
}

export async function unsubscribeKeyword(type: string, keywordId: number) {
  return requestApi<void>(
    `${SUBSCRIPTION_ROUTES.base}/${encodeURIComponent(type)}/keywords/${keywordId}`,
    {
      method: "DELETE"
    }
  );
}

export async function saveKeywordSubscriptions(
  previousIds: number[],
  nextIds: number[],
  type: string
) {
  const previousSet = new Set(previousIds);
  const nextSet = new Set(nextIds);

  const toSubscribe = nextIds.filter((keywordId) => !previousSet.has(keywordId));
  const toUnsubscribe = previousIds.filter((keywordId) => !nextSet.has(keywordId));

  for (const keywordId of toSubscribe) {
    await subscribeKeyword(type, keywordId);
  }

  for (const keywordId of toUnsubscribe) {
    await unsubscribeKeyword(type, keywordId);
  }
}
