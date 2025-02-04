"use client";

import * as React from "react";
import { extendTheme } from "@mui/material/styles";
import { AppProvider, Navigation } from "@toolpad/core";
import DashboardLayout from "./dashboard-layout";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";

const NAVIGATION: Navigation = [
  {
    segment: "home",
    title: "Home",
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

function useDemoRouter(initialPath: string): Router {
  const [pathname, setPathname] = React.useState(initialPath);

  return React.useMemo(() => ({
    pathname,
    searchParams: new URLSearchParams(),
    navigate: (path: string | URL) => setPathname(String(path)),
  }), [pathname]);
}

interface DashboardLayoutBasicProps {
  window?: () => Window;
}

export default function DashboardLayoutBasic(props: DashboardLayoutBasicProps) {
  const { window } = props;
  const router = useDemoRouter("/dashboard");
  const demoWindow = window ? window() : undefined;

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout router={router} />
    </AppProvider>
  );
}