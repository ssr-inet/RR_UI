"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function InetSidebarNavbar() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="sticky top-0 z-50 bg-background border-b border-border/40 p-4 flex items-center justify-between">
      <SidebarTrigger />
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <span>{greeting} 👋</span>
        <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}
