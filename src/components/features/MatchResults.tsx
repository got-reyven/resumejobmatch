"use client";

import Link from "next/link";
import {
  Briefcase,
  User,
  LogIn,
  Save,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MatchScoreDisplay,
  type MatchScoreDisplayProps,
} from "@/components/features/MatchScoreDisplay";
import {
  SkillsBreakdownDisplay,
  type SkillsBreakdownDisplayProps,
} from "@/components/features/SkillsBreakdownDisplay";
import {
  ActionItemsDisplay,
  type ActionItemsDisplayProps,
} from "@/components/features/ActionItemsDisplay";
import {
  TopStrengthsDisplay,
  type TopStrengthsDisplayProps,
} from "@/components/features/TopStrengthsDisplay";
import {
  ATSKeywordDisplay,
  type ATSKeywordDisplayProps,
} from "@/components/features/ATSKeywordDisplay";
import {
  ExperienceAlignmentDisplay,
  type ExperienceAlignmentDisplayProps,
} from "@/components/features/ExperienceAlignmentDisplay";

interface MatchResultsProps {
  score: MatchScoreDisplayProps;
  skillsBreakdown: SkillsBreakdownDisplayProps;
  actionItems: ActionItemsDisplayProps;
  topStrengths: TopStrengthsDisplayProps;
  atsKeywords: ATSKeywordDisplayProps;
  experienceAlignment: ExperienceAlignmentDisplayProps;
  isLoggedIn?: boolean;
  savedMatchId?: string | null;
}

function ViewMoreInsightsCTA({ matchId }: { matchId?: string | null }) {
  const href = matchId ? `/dashboard/match/${matchId}` : "/dashboard/history";

  return (
    <Card className="flex flex-col justify-center rounded-2xl border-2 border-foreground bg-white">
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold">View More Insights</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Your results have been saved. View detailed insights, parsed resume
          data, and more in your dashboard.
        </p>

        <Button asChild size="sm" className="gap-2">
          <Link href={href}>
            View Full Insights
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function UnlockMoreCTA() {
  return (
    <Card className="flex flex-col justify-center rounded-2xl border-2 border-foreground bg-white">
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold">Unlock More Insights</h3>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2.5">
            <Save
              className="h-5 w-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">Login to Save Insights</p>
              <p className="text-xs text-muted-foreground">
                Keep your results and access them anytime
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/auth/login?next=/dashboard">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2">
              <Link href="/register">Register Free</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            With a free account you also get
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Qualification fit &amp; resume section scoring
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Interview focus points for hiring managers
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Tailored summary &amp; rewrite suggestions
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              Save match history &amp; share results
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              .. and many more!
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function MatchResults({
  score,
  skillsBreakdown,
  actionItems,
  topStrengths,
  atsKeywords,
  experienceAlignment,
  isLoggedIn = false,
  savedMatchId,
}: MatchResultsProps) {
  const ctaCard = isLoggedIn ? (
    <ViewMoreInsightsCTA matchId={savedMatchId} />
  ) : (
    <UnlockMoreCTA />
  );

  return (
    <div className="w-full">
      <Tabs defaultValue="jobseeker">
        <TabsList className="mx-auto w-full max-w-md">
          <TabsTrigger value="jobseeker" className="flex-1 gap-2">
            <User className="h-4 w-4" aria-hidden="true" />
            For Jobseekers
          </TabsTrigger>
          <TabsTrigger value="business" className="flex-1 gap-2">
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            For Business
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobseeker" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <MatchScoreDisplay {...score} />
              </CardContent>
            </Card>
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <SkillsBreakdownDisplay {...skillsBreakdown} />
              </CardContent>
            </Card>
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <ActionItemsDisplay {...actionItems} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <ATSKeywordDisplay {...atsKeywords} />
              </CardContent>
            </Card>
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <ExperienceAlignmentDisplay {...experienceAlignment} />
              </CardContent>
            </Card>
            {ctaCard}
          </div>
        </TabsContent>

        <TabsContent value="business" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <MatchScoreDisplay {...score} />
              </CardContent>
            </Card>
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <SkillsBreakdownDisplay {...skillsBreakdown} />
              </CardContent>
            </Card>
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <TopStrengthsDisplay {...topStrengths} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="min-w-0 overflow-hidden rounded-2xl border-0 bg-white">
              <CardContent>
                <ExperienceAlignmentDisplay {...experienceAlignment} />
              </CardContent>
            </Card>
            {ctaCard}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
