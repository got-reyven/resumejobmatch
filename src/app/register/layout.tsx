import Image from "next/image";
import Link from "next/link";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
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
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
