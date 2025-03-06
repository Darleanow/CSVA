"use client";

import Sidebar from "../components/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <Sidebar>{children}</Sidebar>;
}