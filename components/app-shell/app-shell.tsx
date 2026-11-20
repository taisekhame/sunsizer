"use client";

import React, { useState } from "react";
import { AppSidebar, MobileSidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <MobileSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 md:pt-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
