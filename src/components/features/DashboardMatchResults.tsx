"use client";

import { Briefcase, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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

interface DashboardMatchResultsProps {
  score: MatchScoreDisplayProps;
  skillsBreakdown: SkillsBreakdownDisplayProps;
  actionItems: ActionItemsDisplayProps;
  topStrengths: TopStrengthsDisplayProps;
  atsKeywords: ATSKeywordDisplayProps;
  experienceAlignment: ExperienceAlignmentDisplayProps;
  userType: string;
  tier: string;
}

export function DashboardMatchResults({
  score,
  skillsBreakdown,
  actionItems,
  topStrengths,
  atsKeywords,
  experienceAlignment,
  userType,
  tier,
}: DashboardMatchResultsProps) {
  const isPro = tier === "pro";
  const defaultTab = userType === "business" ? "business" : "jobseeker";
  const showJobseekerTab = isPro || userType === "jobseeker";
  const showBusinessTab = isPro || userType === "business";

  const cardClass = "break-inside-avoid overflow-hidden mb-6";

  const jobseekerCards = (
    <div className="[column-count:1] [column-gap:1.5rem] md:[column-count:2] lg:[column-count:3]">
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <MatchScoreDisplay {...score} />
          </CardContent>
        </Card>
      </div>
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <SkillsBreakdownDisplay {...skillsBreakdown} />
          </CardContent>
        </Card>
      </div>
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <ActionItemsDisplay {...actionItems} />
          </CardContent>
        </Card>
      </div>
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <ATSKeywordDisplay {...atsKeywords} />
          </CardContent>
        </Card>
      </div>
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <ExperienceAlignmentDisplay {...experienceAlignment} />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const businessCards = (
    <div className="[column-count:1] [column-gap:1.5rem] md:[column-count:2] lg:[column-count:3]">
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <MatchScoreDisplay {...score} />
          </CardContent>
        </Card>
      </div>
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <SkillsBreakdownDisplay {...skillsBreakdown} />
          </CardContent>
        </Card>
      </div>
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <TopStrengthsDisplay {...topStrengths} />
          </CardContent>
        </Card>
      </div>
      <div className={cardClass}>
        <Card>
          <CardContent className="overflow-hidden">
            <ExperienceAlignmentDisplay {...experienceAlignment} />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-full overflow-hidden">
      <Tabs defaultValue={defaultTab}>
        {isPro && (
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
        )}

        {showJobseekerTab && (
          <TabsContent value="jobseeker" className="mt-6">
            {jobseekerCards}
          </TabsContent>
        )}

        {showBusinessTab && (
          <TabsContent value="business" className="mt-6">
            {businessCards}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
