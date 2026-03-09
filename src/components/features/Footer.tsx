import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Home">
          <Image
            src="/logo.svg"
            alt="Resume Job Match"
            width={140}
            height={21}
          />
        </Link>

        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="#insights"
            className="transition-colors hover:text-foreground"
          >
            What We Give
          </Link>
          <Link
            href="#pricing"
            className="transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Resume Job Match. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
