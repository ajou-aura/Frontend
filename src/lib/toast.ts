import type { ReactNode } from "react";

export type ToastTone = "success" | "error" | "warn" | "info";

export type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

type Listener = () => void;

let toasts: ToastItem[] = [];
let seed = 0;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function pushToast(tone: ToastTone, message: string) {
  const id = ++seed;
  toasts = [...toasts, { id, tone, message }];
  emit();

  setTimeout(() => {
    dismissToast(id);
  }, 2200);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts() {
  return toasts;
}

export const notify = {
  success(message: string) {
    pushToast("success", message);
  },
  error(message: string) {
    pushToast("error", message);
  },
  warn(message: string) {
    pushToast("warn", message);
  },
  info(message: string) {
    pushToast("info", message);
  }
};
