import { getAuthState, subscribeAuthStore } from "@/src/lib/auth/store";
import { useSyncExternalStore } from "react";

export function useAuth() {
  return useSyncExternalStore(subscribeAuthStore, getAuthState, getAuthState);
}
