"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        <Link href="/" className="flex items-center gap-2" aria-label="Home">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">ResumeMatch</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 sm:flex">
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            How It Works
          </Link>
          <Link
            href="#insights"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            What We Give
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Pricing
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
