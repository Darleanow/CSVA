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
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Welcome to CSV Analyzer</h1>
            <p className="text-gray-600 mt-2">Please sign in to continue</p>
          </div>
          <LoginForm />
        </div>
      </main>
  );
}