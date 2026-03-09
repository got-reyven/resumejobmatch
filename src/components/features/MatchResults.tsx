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

interface MatchResultsProps {
  score: MatchScoreDisplayProps;
  skillsBreakdown: SkillsBreakdownDisplayProps;
  actionItems: ActionItemsDisplayProps;
  topStrengths: TopStrengthsDisplayProps;
}

export function MatchResults({
  score,
  skillsBreakdown,
  actionItems,
  topStrengths,
}: MatchResultsProps) {
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

        <TabsContent value="jobseeker" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardContent>
                <MatchScoreDisplay {...score} />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <SkillsBreakdownDisplay {...skillsBreakdown} />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <ActionItemsDisplay {...actionItems} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardContent>
                <MatchScoreDisplay {...score} />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <SkillsBreakdownDisplay {...skillsBreakdown} />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <TopStrengthsDisplay {...topStrengths} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
