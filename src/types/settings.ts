export type Keyword = {
  id: number;
  phrase: string;
  scope: "GLOBAL" | "USER";
  ownerId: number | null;
  globalRefId: number | null;
  createdAt: string;
};

export type SubscriptionMode = "ALL" | "KEYWORD" | "NONE" | null;
