import Link from "next/link";
import { APP_NAME } from "@/lib/constants/app";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-xl font-bold tracking-tight"
        aria-label={`${APP_NAME} home`}
      >
        {APP_NAME}
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
