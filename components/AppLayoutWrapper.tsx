"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useSidebar } from "@/components/SidebarProvider";

export default function AppLayoutWrapper({ children, user }: { children: React.ReactNode, user: any }) {
  const { isMini, isMobileOpen, closeMobileSidebar } = useSidebar();

  const sidebarWidth = isMini ? "var(--gem-sidebar-mini)" : "var(--gem-sidebar-width)";

  return (
    <div className="wrapper">
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div className="gem-backdrop" onClick={closeMobileSidebar} />
      )}

      {/* Sidebar */}
      <Sidebar
        userRole={user.role}
        userName={user.name || "User"}
        userEmail={user.email || ""}
      />

      {/* Main content */}
      <main
        className="main-content"
        style={{ marginLeft: sidebarWidth }}
      >
        <Navbar userName={user.name || "User"} userRole={user.role} />
        <div className="content-inner animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
