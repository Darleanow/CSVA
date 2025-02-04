'use client';

import AuthGuard from '../components/AuthGuard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, signOut } = useAuth();

    return (
        <AuthGuard>
            <div className="min-h-screen p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
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
                {/* Your dashboard content */}
            </div>
        </AuthGuard>
    );
}