"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { LogOut } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function InetSidebarNavbar() {
  const router = useRouter();

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const { theme, setTheme } = useTheme();
  const handleLogout = async () => {
    try {
      const response = await axios.post("/api/auth/logout");
      if (response.data.success) {
        toast.success("Logged out successfully");
      }
      router.push("/auth/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <div className="sticky top-0 z-50 bg-background border-b border-border/40 p-4 flex items-center justify-between">
      <SidebarTrigger />
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <span>{greeting} 👋</span>
        <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div className="flex justify-between gap-2 items-center" >
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
        <Button variant="destructive" size="icon" onClick={handleLogout}>
          <LogOut />
        </Button>
      </div>
    </div>
  );
}
