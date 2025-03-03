"use client";

import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

interface DashboardLayoutWrapperProps {
  router: {
    pathname: string;
  };
  children?: React.ReactNode;
}

export default function DashboardLayoutWrapper({ router, children }: DashboardLayoutWrapperProps) {
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
      {children}
    </DashboardLayout>
  );
}