"use client";

import { AuthProvider } from "../context/auth-context";

export default function AuthWrapper({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
