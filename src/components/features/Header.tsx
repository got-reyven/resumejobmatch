"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, History, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface UserInfo {
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", authUser.id)
          .single()
          .then(({ data }) => {
            setUser({
              email: authUser.email ?? "",
              name: data?.full_name ?? null,
              avatarUrl: data?.avatar_url ?? null,
            });
          });
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "bg-background/80 shadow-sm backdrop-blur-sm"
          : "bg-transparent"
      )}
    >
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Home">
          <Image
            src="/logo.svg"
            alt="Resume Job Match"
            width={220}
            height={40}
            priority
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 sm:flex">
          <Link
            href="#how-it-works"
            className={cn(
              "text-sm font-medium transition-colors",
              scrolled
                ? "text-foreground hover:text-primary"
                : "text-white/80 hover:text-white"
            )}
          >
            How It Works
          </Link>
          <Link
            href="#insights"
            className={cn(
              "text-sm font-medium transition-colors",
              scrolled
                ? "text-foreground hover:text-primary"
                : "text-white/80 hover:text-white"
            )}
          >
            What We Give
          </Link>
          <Link
            href="#pricing"
            className={cn(
              "text-sm font-medium transition-colors",
              scrolled
                ? "text-foreground hover:text-primary"
                : "text-white/80 hover:text-white"
            )}
          >
            Pricing
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    scrolled
                      ? "bg-background/80 hover:bg-muted"
                      : "border-white/20 bg-white/15 text-white hover:bg-white/25"
                  )}
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </span>
                  )}
                  <span className="max-w-[160px] truncate text-sm font-medium">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/history" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  !scrolled && "text-white hover:bg-white/10 hover:text-white"
                )}
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className={cn(
                  !scrolled && "bg-white text-slate-900 hover:bg-white/90"
                )}
              >
                <Link href="/register">Register for FREE</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
