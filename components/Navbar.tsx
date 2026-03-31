"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSidebar } from "@/components/SidebarProvider";

interface NavbarProps {
  userName?: string;
  userRole?: string;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Navbar({ userName, userRole }: NavbarProps) {
  const initials = getInitials(userName || "User");
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="gem-navbar">
      {/* Mobile hamburger */}
      <button className="gem-navbar__hamburger" onClick={toggleMobileSidebar} aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Desktop sidebar toggle */}
      <button className="gem-navbar__icon-btn d-none d-lg-flex" onClick={toggleSidebar} aria-label="Toggle sidebar" style={{ marginRight: 4 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Search */}
      <div className="gem-navbar__search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="search" placeholder="Search..." aria-label="Search" />
      </div>

      <div className="gem-navbar__spacer" />

      <div className="gem-navbar__actions">
        {/* Notification */}
        <div className={`gem-dropdown ${notifOpen ? "gem-dropdown--open" : ""}`} ref={notifRef}>
          <button className="gem-navbar__icon-btn" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="gem-navbar__badge" />
          </button>
          <div className="gem-dropdown__menu" style={{ minWidth: 280 }}>
            <div className="gem-dropdown__header">
              <h6>Notifications</h6>
              <span>Stay updated</span>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--gem-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gem-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>System Status</div>
                  <div style={{ fontSize: 12, color: 'var(--gem-text-secondary)' }}>All systems operational</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className={`gem-dropdown ${profileOpen ? "gem-dropdown--open" : ""}`} ref={profileRef}>
          <div className="gem-navbar__avatar" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
            {initials}
          </div>
          <div className="gem-dropdown__menu">
            <div className="gem-dropdown__header">
              <h6>{userName || "User"}</h6>
              {userRole && <span>{userRole}</span>}
            </div>
            <Link href="#" className="gem-dropdown__item" onClick={() => setProfileOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              My Profile
            </Link>
            <div className="gem-dropdown__divider" />
            <button className="gem-dropdown__item gem-dropdown__item--danger" onClick={() => signOut({ callbackUrl: "/login" })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
