import Image from "next/image";
import Link from "next/link";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30 p-3 sm:p-5">
      <div className="hero-box flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16">
        <Link href="/" className="mb-8" aria-label="Resume Job Match home">
          <Image
            src="/logo.svg"
            alt="Resume Job Match"
            width={260}
            height={50}
            priority
          />
        </Link>
        <div className="w-full max-w-2xl">{children}</div>
        <p className="mt-8 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
