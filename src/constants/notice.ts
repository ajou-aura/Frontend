export const DEFAULT_GLOBAL_TAGS = [
  "수강신청",
  "봉사",
  "계절학기",
  "강의",
  "휴학",
  "수업",
  "공모전",
  "장학",
  "채용",
  "논문",
  "대회"
];

export const SYSTEM_NOTICE_TYPES = [
  "general",
  "scholarship",
  "dormitory"
] as const;

export const NOTICE_TABS = [
  { key: "general", label: "일반" },
  { key: "scholarship", label: "장학" },
  { key: "dormitory", label: "생활관" },
  { key: "department", label: "학과" }
] as const;

export type NoticeTabKey = (typeof NOTICE_TABS)[number]["key"];

export const MATCH_OPTIONS = [
  { key: "any", label: "일부 포함" },
  { key: "all", label: "전부 포함" }
] as const;

export type MatchMode = (typeof MATCH_OPTIONS)[number]["key"];
