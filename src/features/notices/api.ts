import { NOTICE_ROUTES } from "@/src/lib/api/routes";
import { requestApi } from "@/src/lib/api/client";
import type { NoticePage, NoticeQuery } from "@/src/types/notices";

export async function fetchNoticePage(query: NoticeQuery) {
  return requestApi<NoticePage>(NOTICE_ROUTES.page, {
    method: "GET",
    query: {
      page: query.page ?? 0,
      size: query.size ?? 10,
      type: query.type,
      search: query.search,
      sort: query.sort ?? "date,desc",
      globalIds: query.globalIds,
      personalIds: query.personalIds,
      match: query.match ?? "any"
    }
  });
}
