"use client";

import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
export default function AuthGuard({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      if (window.location.pathname !== "/") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center">
        <CircularProgress size={40} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
