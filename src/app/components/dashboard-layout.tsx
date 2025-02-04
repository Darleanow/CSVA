"use client";

import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import HomePage from "../home/page";
import AnalyticsPage from "../analytics/page";

interface DashboardLayoutWrapperProps {
  router: {
    pathname: string;
  };
}

export default function DashboardLayoutWrapper({ router }: DashboardLayoutWrapperProps) {
  const renderContent = () => {
    switch (router.pathname) {
      case "/home":
        return <HomePage />;
      case "/analytics":
        return <AnalyticsPage />;
      default:
        return <HomePage />;
    }
  };

  function CustomAppTitle() {
    return (
      <div
        style={{
          fontSize: "1.25rem",
          color: "var(--mui-palette-primary-main)",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
        }}
      >
        CSVA
      </div>
    );
  }

  return (
    <DashboardLayout slots={{ appTitle: CustomAppTitle }}>
      {renderContent()}
    </DashboardLayout>
  );
}