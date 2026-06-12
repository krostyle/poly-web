"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useMe } from "@/features/auth/hooks/useMe";
import { OnboardingRolModal } from "@/features/auth/components/OnboardingRolModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const { data: me } = useMe();

  const needsOnboarding =
    me !== undefined &&
    me.usuario.rol !== "ADMIN" &&
    !me.usuario.onboarding_completado;

  return (
    <div className="flex h-full min-h-screen">
      {needsOnboarding && <OnboardingRolModal />}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={openSidebar} />
        <main className="flex-1 p-4 md:p-6 bg-(--slate-100)">{children}</main>
      </div>
    </div>
  );
}
