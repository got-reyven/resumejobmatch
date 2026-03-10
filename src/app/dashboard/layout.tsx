import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/features/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_type, avatar_url")
    .eq("id", user.id)
    .single();

  const userType = profile?.user_type ?? "jobseeker";
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        userType={userType}
        displayName={displayName}
        email={user.email ?? ""}
      />

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-6 lg:hidden">
          <Link href="/dashboard" aria-label="Dashboard home">
            <Image
              src="/logo.svg"
              alt="Resume Job Match"
              width={140}
              height={21}
            />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
