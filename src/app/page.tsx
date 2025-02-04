"use client";

import { useAuth } from "./context/auth-context";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, signIn, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    router.push("/dashboard");
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to CSV Analyzer</h1>
        <p className="text-gray-600">Please sign in to continue</p>
        <button
          onClick={signIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
