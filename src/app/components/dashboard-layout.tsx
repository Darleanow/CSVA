"use client";

import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useAuth } from "../context/auth-context";

interface DashboardLayoutWrapperProps {
  router: {
    pathname: string;
  };
  children?: React.ReactNode;
}

interface CustomAppTitleProps {
  readonly email?: string;
}

function CustomAppTitle({ email }: Readonly<CustomAppTitleProps>) {
  return (
    <div
      style={{
        fontSize: "1.25rem",
        color: "var(--mui-palette-primary-main)",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      CSVA
      {email && (
        <span style={{ fontSize: "1rem", fontWeight: "400", color: "gray" }}>
          ({email})
        </span>
      )}
    </div>
  );
}

function getAppTitle(email?: string) {
  return <CustomAppTitle email={email} />;
}

export default function DashboardLayoutWrapper({ children }: Readonly<DashboardLayoutWrapperProps>) {
  const { user } = useAuth();

  const appTitle = React.useMemo(() => getAppTitle(user?.email ?? undefined), [user?.email]);

  return (
    <DashboardLayout
      slots={{
        appTitle: () => appTitle,
      }}
    >
      {children}
    </DashboardLayout>
  );
}