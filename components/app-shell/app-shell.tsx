"use client";

import React, { useState } from "react";
import { AppSidebar, MobileSidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: "ADMIN" | "INSTALLER";
  userEmail: string;
}

export function AppShell({ children, userName, userRole, userEmail }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        userName={userName}
        userRole={userRole}
        userEmail={userEmail}
      />
      <MobileSidebar userName={userName} userRole={userRole} userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6 md:p-8 md:pt-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
