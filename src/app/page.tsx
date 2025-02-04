"use client";

import { useAuth } from "./context/auth-context";
import { useRouter } from "next/navigation";
import LoginForm from "./components/login-form";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
    );
  }

  if (user) {
    router.push("/dashboard");
    return null;
  }

  return (
      <main className="min-h-screen flex items-center justify-center">
          <LoginForm />
      </main>
  );
}