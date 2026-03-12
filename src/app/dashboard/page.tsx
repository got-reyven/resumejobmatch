import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, History, Settings, Briefcase, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GuestMatchBanner } from "@/components/features/GuestMatchBanner";
import { UsageChart } from "@/components/features/UsageChart";
import { createClient } from "@/lib/supabase/server";
import { RATE_LIMITS } from "@/lib/constants/app";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_type, tier")
    .eq("id", user.id)
    .maybeSingle();

  const userType = (profile?.user_type ?? "jobseeker") as
    | "jobseeker"
    | "business";
  const tier = (profile?.tier ?? "free") as "free" | "pro";
  const firstName =
    profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const isJobseeker = userType === "jobseeker";
  const TypeIcon = isJobseeker ? User : Briefcase;

  const today = new Date().toISOString().slice(0, 10);
  const { count: matchesToday } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00`)
    .lt("created_at", `${today}T23:59:59.999`);
  const used = matchesToday ?? 0;
  const dailyLimit = RATE_LIMITS[userType][tier].dailyMatches;
  const isPro = tier === "pro";

  return (
    <div>
      <GuestMatchBanner />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isJobseeker
              ? "Upload your resume and match it against any job description."
              : "Evaluate candidates against your job requirements with AI-powered insights."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <TypeIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium capitalize">
              {userType} — {isPro ? "Pro" : "Free"}
            </p>
            {!isPro && (
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      used >= dailyLimit ? "bg-red-500" : "bg-[#6696C9]"
                    }`}
                    style={{
                      width: `${Math.min((used / dailyLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {used}/{dailyLimit} today
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/match">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                <PlusCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">New Match</p>
                <p className="text-xs text-muted-foreground">
                  Upload resume &amp; paste a job description
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/history">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <History className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="font-medium">Match History</p>
                <p className="text-xs text-muted-foreground">
                  View your past match results
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/settings">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Settings className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">
                  Manage your account
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <UsageChart />
      </div>
    </div>
  );
}
