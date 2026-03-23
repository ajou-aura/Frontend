export const AUTH_ROUTES = {
  google: "/auth/google",
  appExchange: "/auth/app/exchange",
  refresh: "/auth/refresh",
  logout: "/auth/logout"
} as const;

export const USER_ROUTES = {
  info: "/user/info",
  departments: "/user/departments",
  savedNotices: "/user/saved-notices"
} as const;

export const NOTICE_ROUTES = {
  page: "/notices/page"
} as const;

export const KEYWORD_ROUTES = {
  list: "/keywords",
  global: "/keywords/global"
} as const;

export const SUBSCRIPTION_ROUTES = {
  base: "/subscriptions/types"
} as const;
