"use client";

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
  const { displayName, email, avatarUrl, userType } = useProfile();
  const pathname = usePathname();
  const router = useRouter();

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
    <aside className="hidden h-screen w-64 shrink-0 sticky top-0 border-r bg-muted/30 lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" aria-label="Dashboard home">
          <Image
            src="/logo-default.svg"
            alt="Resume Job Match"
            width={220}
            height={40}
          />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#B5DAF2]/30 text-[#6696C9] font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
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
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            <div className="mt-1 flex items-center gap-1.5">
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
                className="px-1.5 py-0 text-[10px] leading-4"
              >
                Free
              </Badge>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-red-600"
        >
          <LogOut className="h-3 w-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
