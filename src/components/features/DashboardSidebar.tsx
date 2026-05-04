"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Settings,
  Users,
  LogOut,
  Briefcase,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  GitCompareArrows,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/components/features/ProfileContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
}

export function DashboardSidebar() {
  const { displayName, email, avatarUrl, userType, tier } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: "/dashboard/match",
      label: "Matches",
      icon: PlusCircle,
      show: true,
    },
    {
      href: "/dashboard/compare",
      label: "Compare",
      icon: GitCompareArrows,
      show: true,
    },
    {
      href: "/dashboard/history",
      label: "History",
      icon: History,
      show: true,
    },
    {
      href: "/dashboard/team",
      label: "Team",
      icon: Users,
      show: userType === "business",
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      show: true,
    },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const TypeIcon = userType === "business" ? Briefcase : User;

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 sticky top-0 border-r bg-muted/30 lg:flex lg:flex-col transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-14 items-center border-b",
          collapsed ? "justify-center px-2" : "px-6"
        )}
      >
        <Link href="/dashboard" aria-label="Dashboard home">
          {collapsed ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6696C9] text-sm font-bold text-white">
              R
            </span>
          ) : (
            <Image
              src="/logo-default.svg"
              alt="Resume Job Match"
              width={220}
              height={40}
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1 py-4", collapsed ? "px-2" : "px-3")}>
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center rounded-lg text-sm font-medium transition-colors cursor-pointer group",
                  collapsed
                    ? "justify-center px-0 py-2.5"
                    : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-[#B5DAF2]/30 text-[#6696C9] font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-2 z-50 hidden whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-lg group-hover:block">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

        {/* Sign Out — grouped with nav */}
        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "relative flex w-full items-center rounded-lg text-sm font-medium transition-colors cursor-pointer group text-muted-foreground hover:bg-red-50 hover:text-red-600",
            collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign Out"}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-2 z-50 hidden whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-lg group-hover:block">
              Sign Out
            </span>
          )}
        </button>
      </nav>

      {/* User info */}
      <div className={cn("border-t", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <TypeIcon className="h-4 w-4 text-primary" />
              )}
              <span className="pointer-events-none absolute left-full ml-2 z-50 hidden whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-lg group-hover:block">
                {displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <TypeIcon className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between pl-12">
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-1.5 py-0 text-[10px] capitalize leading-4",
                    userType === "business"
                      ? "border-amber-200 text-amber-700"
                      : "border-sky-200 text-sky-700"
                  )}
                >
                  {userType}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-1.5 py-0 text-[10px] capitalize leading-4"
                >
                  {tier}
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
