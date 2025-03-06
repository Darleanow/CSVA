"use client";

import { useAuth } from "../context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
    const { signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        signOut().then(() => {
            router.push("/");
        });
    }, [router, signOut]);

    return <p>Signed out successfully! Redirecting...</p>;
}
