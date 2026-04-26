import type { AuthSession, AuthSnapshot, UserProfile } from "@/src/types/auth";
import {
  getStoredValue,
  removeStoredValue,
  setStoredValue
} from "@/src/lib/storage/kv";

type Listener = () => void;

const AUTH_STORAGE_KEY = "aura.auth.v1";

type PersistedAuthState = Pick<AuthSnapshot, "session" | "profile" | "needsOnboarding">;

let authState: AuthSnapshot = {
  hydrated: false,
  bootstrapping: false,
  session: null,
  profile: null,
  needsOnboarding: false
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setAuthState(patch: Partial<AuthSnapshot>) {
  authState = {
    ...authState,
    ...patch
  };
  emit();
}

async function persistAuthState() {
  if (!authState.session) {
    await removeStoredValue(AUTH_STORAGE_KEY);
    return;
  }

  const value: PersistedAuthState = {
    session: authState.session,
    profile: authState.profile,
    needsOnboarding: authState.needsOnboarding
  };

  await setStoredValue(AUTH_STORAGE_KEY, JSON.stringify(value));
}

export function subscribeAuthStore(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthState() {
  return authState;
}

export async function hydrateAuthState() {
  try {
    const stored = await getStoredValue(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedAuthState;
      setAuthState({
        session: parsed.session ?? null,
        profile: parsed.profile ?? null,
        needsOnboarding: parsed.needsOnboarding ?? false
      });
    }
  } catch {
    await removeStoredValue(AUTH_STORAGE_KEY);
  } finally {
    setAuthState({
      hydrated: true,
      bootstrapping: true
    });
  }
}

export function setAuthBootstrapping(bootstrapping: boolean) {
  setAuthState({ bootstrapping });
}

export async function writeAuthSession(
  session: AuthSession,
  profile: UserProfile | null,
  needsOnboarding: boolean
) {
  setAuthState({
    session,
    profile,
    needsOnboarding
  });
  await persistAuthState();
}

export async function writeAuthProfile(profile: UserProfile | null) {
  setAuthState({ profile });
  await persistAuthState();
}

export async function writeOnboardingFlag(needsOnboarding: boolean) {
  setAuthState({ needsOnboarding });
  await persistAuthState();
}

export async function clearAuthState() {
  setAuthState({
    session: null,
    profile: null,
    needsOnboarding: false
  });
  await removeStoredValue(AUTH_STORAGE_KEY);
}
