import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  History,
  Settings,
  Briefcase,
  User,
  Rocket,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GuestMatchBanner } from "@/components/features/GuestMatchBanner";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, user_type")
    .eq("id", user.id)
    .single();

  const userType = profile?.user_type ?? "jobseeker";
  const firstName =
    profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const isJobseeker = userType === "jobseeker";
  const TypeIcon = isJobseeker ? User : Briefcase;

  return (
    <div>
      <GuestMatchBanner />

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isJobseeker
            ? "Upload your resume and match it against any job description."
            : "Evaluate candidates against your job requirements with AI-powered insights."}
        </p>
      </div>

      <div className="mb-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Start a New Match</h2>
                <p className="text-sm text-muted-foreground">
                  Get instant insights on how well a resume fits a job.
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard/match">
                <PlusCircle className="h-5 w-5" />
                New Match
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/match">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <PlusCircle className="h-5 w-5 text-primary" />
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
          <Card className="h-full transition-shadow hover:shadow-md">
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
          <Card className="h-full transition-shadow hover:shadow-md">
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

      <div className="mt-8 rounded-lg border bg-muted/30 p-6">
        <div className="flex items-center gap-3">
          <TypeIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium capitalize">
              {userType} Account — Free Plan
            </p>
            <p className="text-xs text-muted-foreground">
              {isJobseeker
                ? "10 matches per day • Basic jobseeker insights • 3-day history"
                : "10 matches per day • Basic hiring insights • 14-day history"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
