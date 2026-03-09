import Link from "next/link";
import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Home">
          <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-semibold">ResumeMatch</span>
        </Link>

        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ResumeMatch. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
