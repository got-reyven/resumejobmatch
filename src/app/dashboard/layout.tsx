import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/features/DashboardSidebar";
import { ProfileProvider } from "@/components/features/ProfileContext";

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
    .select("full_name, user_type, tier, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const userType = profile?.user_type ?? "jobseeker";
  const tier = profile?.tier ?? "free";
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <ProfileProvider
      initial={{
        displayName,
        email: user.email ?? "",
        avatarUrl,
        userType,
        tier,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center border-b px-6 lg:hidden">
            <Link href="/dashboard" aria-label="Dashboard home">
              <Image
                src="/logo-default.svg"
                alt="Resume Job Match"
                width={140}
                height={21}
              />
            </Link>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}
