import { USER_ROUTES } from "@/src/lib/api/routes";
import { requestApi } from "@/src/lib/api/client";
import type { Notice } from "@/src/types/notices";

export async function listNoticeBookmarks() {
  return requestApi<Notice[]>(USER_ROUTES.savedNotices, {
    method: "GET"
  });
}

export async function addNoticeBookmark(id: string) {
  return requestApi<void>(`${USER_ROUTES.savedNotices}/${encodeURIComponent(id)}`, {
    method: "POST"
  });
}

export async function removeNoticeBookmark(id: string) {
  return requestApi<void>(`${USER_ROUTES.savedNotices}/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export async function setNoticeBookmark(id: string, marked: boolean) {
  if (marked) {
    return addNoticeBookmark(id);
  }

  return removeNoticeBookmark(id);
}
