"use client";

import AuthGuard from "../components/auth-guard";
import { useAuth } from "../context/auth-context";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <AuthGuard>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
