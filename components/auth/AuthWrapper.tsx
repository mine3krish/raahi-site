"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/ui/Loading";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthWrapper({ children, requireAuth = false }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (requireAuth && !token) {
      router.push("/login");
    } else if (!requireAuth && token) {
      router.push("/");
    } else {
      setIsAuthenticated(!!token);
    }

    setLoading(false);
  }, [requireAuth, router]);

  if (loading) return <LoadingOverlay show text="Checking authentication..." />;

  if (requireAuth && !isAuthenticated) return null;

  return <>{children}</>;
}
