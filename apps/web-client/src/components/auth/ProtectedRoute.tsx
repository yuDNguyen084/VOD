"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

type Props = {
  children: React.ReactNode;
  requiredRole?: "viewer" | "creator" | "admin";
};

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace("/");
    }
  }, [user]);

  if (!user) return null;

  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}
