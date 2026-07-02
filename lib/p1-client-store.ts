"use client";

import {
  P1Store,
  Role,
  RegisterMockUserInput,
  registerMockUser,
  seedP1Store
} from "@/lib/p1-domain";

const STORE_KEY = "chaintrace:p1-store";
const CURRENT_USER_KEY = "chaintrace:p1-current-user-id";

export function loadP1Store(): P1Store {
  if (typeof window === "undefined") {
    return seedP1Store();
  }
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    const store = seedP1Store();
    saveP1Store(store);
    return store;
  }

  try {
    return { ...seedP1Store(), ...JSON.parse(raw) } as P1Store;
  } catch {
    const store = seedP1Store();
    saveP1Store(store);
    return store;
  }
}

export function saveP1Store(store: P1Store): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CURRENT_USER_KEY, userId);
}

export function clearCurrentUserId(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function signInExistingWallet(walletAddress: string): string | null {
  const store = loadP1Store();
  const user = store.users.find(
    (item) => item.walletAddress.trim().toLowerCase() === walletAddress.trim().toLowerCase()
  );
  if (!user) {
    return null;
  }
  setCurrentUserId(user.id);
  return user.id;
}

export function registerAndSignIn(input: RegisterMockUserInput): string {
  const store = loadP1Store();
  const user = registerMockUser(store, input);
  saveP1Store(store);
  setCurrentUserId(user.id);
  return user.id;
}

export function getCurrentUser(store: P1Store) {
  const currentUserId = getCurrentUserId();
  return store.users.find((user) => user.id === currentUserId) ?? null;
}

export function routeForRole(role: Role): string {
  switch (role) {
    case "EXPORTER":
      return "/exporter/dashboard";
    case "BUYER":
      return "/dashboard";
    case "LOGISTICS":
      return "/dashboard";
    case "INSPECTOR":
      return "/dashboard";
    case "BANK":
      return "/dashboard";
    case "OPERATOR":
      return "/dashboard";
    case "AUDITOR":
      return "/dashboard";
  }
}
