"use client";

import * as React from "react";
import { extendTheme } from "@mui/material/styles";
import { AppProvider, Navigation } from "@toolpad/core";
import DashboardLayout from "./dashboard-layout";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import LogoutIcon from "@mui/icons-material/Logout";


const NAVIGATION: Navigation = [
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <HomeIcon />,
  },
  {
    segment: "analytics",
    title: "Analytics",
    icon: <BarChartIcon />,
  },
  {
    kind: "divider",
  },
  {
    segment: "logout",
    title: "Déconnexion",
    icon: <LogoutIcon />,
  },
  
];

const demoTheme = extendTheme({
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: "class",
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter() {
  const router = useRouter();

  return {
    pathname: router.pathname,
    searchParams: new URLSearchParams(),
    navigate: (path: string | URL) => {
      if (router.pathname !== String(path)) {
        router.push(String(path));
      }
    },
  };
}

interface SidebarProps {
  children: React.ReactNode;
  window?: () => Window;
}

export default function Sidebar({ children, window }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const router = useDemoRouter();
  const demoWindow = window ? window() : undefined;
  const { signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, [mounted]);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout router={router}>
        {children}
      </DashboardLayout>
    </AppProvider>
  );
}
