import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { registerAuthRefreshHandler } from "@/src/lib/api/client";
import { ApiError } from "@/src/lib/api/errors";
import {
  clearAuthState,
  getAuthState,
  hydrateAuthState,
  setAuthBootstrapping,
  writeAuthProfile,
  writeAuthSession,
  writeOnboardingFlag
} from "@/src/lib/auth/store";
import {
  exchangeAppTicket,
  getGoogleAuthUrl,
  logoutFromBackend,
  refreshAuthTokens
} from "@/src/features/auth/api";
import { fetchCurrentUser } from "@/src/features/settings/api";
import {
  clearNotificationSubscriptions,
  syncNotificationSubscriptions
} from "@/src/lib/notifications/service";

WebBrowser.maybeCompleteAuthSession();

let refreshPromise: Promise<boolean> | null = null;

async function syncNotificationsSafely(context: string) {
  try {
    await syncNotificationSubscriptions();
  } catch (error) {
    console.warn(`[auth] Notification sync failed during ${context}.`, error);
  }
}

async function fetchAndStoreProfile() {
  const profile = await fetchCurrentUser();
  await writeAuthProfile(profile);
  return profile;
}

async function bootstrapAfterLogin(context: string) {
  try {
    await fetchAndStoreProfile();
  } catch (error) {
    console.warn(`[auth] Profile hydration failed during ${context}.`, error);
  }

  await syncNotificationsSafely(context);
}

async function refreshStoredSession() {
  const current = getAuthState();
  if (!current.session?.refreshToken) {
    return false;
  }

  try {
    const refreshed = await refreshAuthTokens(current.session.refreshToken);
    await writeAuthSession(
      {
        ...current.session,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken
      },
      current.profile,
      current.needsOnboarding
    );
    return true;
  } catch {
    await clearNotificationSubscriptions();
    await clearAuthState();
    return false;
  }
}

export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshStoredSession().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

registerAuthRefreshHandler(refreshSession);

export async function initializeAuth() {
  const current = getAuthState();
  if (!current.hydrated) {
    await hydrateAuthState();
  }

  const afterHydrate = getAuthState();
  if (!afterHydrate.session) {
    if (Platform.OS === "web") {
      await restoreWebCookieSession(false);
    }
    setAuthBootstrapping(false);
    return getAuthState();
  }

  try {
    await fetchAndStoreProfile();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshed = await refreshSession();
      if (refreshed) {
        await fetchAndStoreProfile();
      } else {
        await clearNotificationSubscriptions();
        await clearAuthState();
      }
    } else {
      console.warn("[auth] Failed to hydrate persisted session.", error);
      await clearNotificationSubscriptions();
      await clearAuthState();
    }
  } finally {
    setAuthBootstrapping(false);
  }

  await syncNotificationsSafely("initializeAuth");

  return getAuthState();
}

export async function restoreWebCookieSession(signUp: boolean) {
  if (Platform.OS !== "web") {
    return false;
  }

  setAuthBootstrapping(true);

  try {
    const refreshed = await refreshAuthTokens();
    const profile = await fetchCurrentUser();
    await writeAuthSession(
      {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        user: {
          email: profile.email,
          name: profile.name
        },
        source: "web"
      },
      profile,
      signUp
    );
    await syncNotificationsSafely("restoreWebCookieSession");
    return true;
  } catch {
    await clearNotificationSubscriptions();
    await clearAuthState();
    return false;
  } finally {
    setAuthBootstrapping(false);
  }
}

export async function beginGoogleLogin() {
  if (Platform.OS === "web") {
    window.location.assign(getGoogleAuthUrl("web"));
    return { type: "opened" as const };
  }

  return WebBrowser.openAuthSessionAsync(
    getGoogleAuthUrl("app"),
    "aura://oauth-callback"
  );
}

export async function completeNativeOAuth(code: string) {
  const exchanged = await exchangeAppTicket(code);

  await writeAuthSession(
    {
      accessToken: exchanged.accessToken,
      refreshToken: exchanged.refreshToken,
      user: exchanged.user,
      source: "native"
    },
    null,
    exchanged.signUp
  );

  void bootstrapAfterLogin("completeNativeOAuth");

  return exchanged.signUp ? "/select-department" : "/notice";
}

export async function refreshProfile() {
  const profile = await fetchCurrentUser();
  await writeAuthProfile(profile);
  return profile;
}

export async function completeOnboarding() {
  await writeOnboardingFlag(false);
  await refreshProfile();
  await syncNotificationsSafely("completeOnboarding");
}

export async function logout() {
  const refreshToken = getAuthState().session?.refreshToken;

  try {
    await logoutFromBackend(refreshToken);
  } catch {
    // 쿠키/로컬 세션 정리가 우선이라 실패해도 로컬 정리를 진행합니다.
  } finally {
    await clearNotificationSubscriptions();
    await clearAuthState();
  }
}
