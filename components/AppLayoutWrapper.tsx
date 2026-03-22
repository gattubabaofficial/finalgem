"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useSidebar } from "@/components/SidebarProvider";

export default function AppLayoutWrapper({ children, user }: { children: React.ReactNode, user: any }) {
  const { isMini, isMobileOpen, closeMobileSidebar } = useSidebar();

  return (
    <div className="wrapper" suppressHydrationWarning>

      {/* ── Mobile backdrop overlay — closes sidebar when tapped ── */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 1040,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar
        userRole={user.role}
        userName={user.name || "User"}
        userEmail={user.email || ""}
      />

      {/* ── Main content area ── */}
      <main
        className="main-content"
        suppressHydrationWarning
        style={{
          // On desktop: offset by sidebar width; on mobile: no offset (sidebar is a drawer)
          marginLeft: `var(--sidebar-offset, ${isMini ? "4.8rem" : "16.2rem"})`,
          transition: "margin-left 300ms ease",
        }}
      >
        {/* Inject responsive CSS override so margin resets to 0 on mobile */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 991.98px) {
              .main-content {
                margin-left: 0 !important;
              }
              /* Prevent horizontal scroll on mobile */
              body, .wrapper {
                overflow-x: hidden;
              }
            }
          `
        }} />

        <div className="position-relative iq-banner" suppressHydrationWarning>
          <Navbar userName={user.name || "User"} userRole={user.role} />
          <div className="iq-navbar-header" style={{ height: 215 }} suppressHydrationWarning>
            <div className="container-fluid iq-container" suppressHydrationWarning>
              <div className="row" suppressHydrationWarning>
                <div className="col-md-12" suppressHydrationWarning>
                  <div className="flex-wrap d-flex justify-content-between align-items-center" suppressHydrationWarning>
                    <div suppressHydrationWarning>{/* Dynamic Page Headers */}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="iq-header-img" suppressHydrationWarning>
              <img
                src="/hopeui/images/dashboard/top-header.png"
                alt="header"
                className="img-fluid w-100 h-100"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </div>
        </div>

        <div className="content-inner pb-4 animate-fade-in" style={{ zIndex: 10, position: "relative" }} suppressHydrationWarning>
          <div className="container-fluid" style={{ marginTop: "-170px" }} suppressHydrationWarning>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
