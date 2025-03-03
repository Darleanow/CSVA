"use client";

import * as React from "react";
import { extendTheme } from "@mui/material/styles";
import { AppProvider, Navigation } from "@toolpad/core";
import DashboardLayout from "./dashboard-layout";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const NAVIGATION: Navigation = [
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <HomeIcon />,
  },
  {
    kind: "divider",
  },
  {
    segment: "analytics",
    title: "Analytics",
    icon: <BarChartIcon />,
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

interface Router {
  pathname: string;
  searchParams: URLSearchParams;
  navigate: (path: string | URL) => void;
}

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
