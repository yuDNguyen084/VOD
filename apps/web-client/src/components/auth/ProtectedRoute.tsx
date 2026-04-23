"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  children: React.ReactNode;
  requiredRole?: "viewer" | "creator" | "admin" | "USER" | "CREATOR" | "ADMIN";
};

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  // Prevents redirect on reload before initialize() has run
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && (!user.role || user.role.toUpperCase() !== requiredRole.toUpperCase())) {
      router.replace("/");
    }
  }, [user, requiredRole, isHydrated]);

  // Still hydrating — render nothing to avoid flash redirect
  if (!isHydrated) return null;

  if (!user) return null;

  if (requiredRole && (!user.role || user.role.toUpperCase() !== requiredRole.toUpperCase())) return null;

  return <>{children}</>;
}
