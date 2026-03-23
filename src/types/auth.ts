export type SessionUser = {
  email: string;
  name: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
  source: "native" | "web";
};

export type UserProfile = {
  id: number;
  email: string;
  name: string;
  departments: string[];
};

export type AppExchangeResponse = {
  accessToken: string;
  refreshToken: string;
  signUp: boolean;
  user: SessionUser;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSnapshot = {
  hydrated: boolean;
  bootstrapping: boolean;
  session: AuthSession | null;
  profile: UserProfile | null;
  needsOnboarding: boolean;
};
