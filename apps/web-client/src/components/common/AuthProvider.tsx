"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Rehydrates auth state from localStorage on every page load/reload.
 * Must be rendered inside the root layout so it runs before any
 * ProtectedRoute or redirect logic.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
