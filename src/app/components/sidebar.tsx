"use client";   

import * as React from "react";
import { extendTheme } from "@mui/material/styles";
import BarChartIcon from "@mui/icons-material/BarChart";
import HomeIcon from "@mui/icons-material/Home";
import { AppProvider, Navigation } from "@toolpad/core";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

// Pages
import HomePage from "../home/page"; // Importez vos fichiers page.tsx
import AnalyticsPage from "../analytics/page";

const NAVIGATION: Navigation = [
  {
    segment: 'home',
    title: 'Home',
    icon: <HomeIcon />,
  },
  {
    kind: 'divider',
  },
  {
    segment: 'analytics',
    title: 'Analytics',
    icon: <BarChartIcon />,
  },
];

const demoTheme = extendTheme({
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: 'class',
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
  
    const router = React.useMemo(() => {
      return {
        pathname,
        searchParams: new URLSearchParams(),
        navigate: (path: string | URL) => {
          setPathname(String(path));
        },
      };
    }, [pathname]);
  
    return router;
  }

// const Skeleton = styled('div')<{ height: number }>(({ theme, height }) => ({
//   backgroundColor: theme.palette.action.hover,
//   borderRadius: theme.shape.borderRadius,
//   height,
//   content: '" "',
// }));

interface DashboardLayoutBasicProps {
  window?: () => Window;
}

export default function DashboardLayoutBasic(props: DashboardLayoutBasicProps) {
  const { window } = props;

  const router = useDemoRouter('/dashboard');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window ? window() : undefined;
  function CustomAppTitle() {
    return <div style={{ fontSize: '1.25rem', color: 'var(--mui-palette-primary-main)', fontWeight: '700', display: 'flex', alignItems: 'center' }}>CSVA</div>;
  }

  const renderContent = () => {
    switch (router.pathname) {
      case '/home':
        return <HomePage />;
      case '/analytics':
        return <AnalyticsPage />;
    }
  };

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout slots={{ appTitle: CustomAppTitle }}>
        {renderContent()}
      </DashboardLayout>
    </AppProvider>
  );
}
