"use client";

import { useCallback, useState } from "react";
import {
  Briefcase,
  User,
  SlidersHorizontal,
  Eye,
  EyeOff,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  QualificationFitDisplay,
  type QualificationFitDisplayProps,
} from "@/components/features/QualificationFitDisplay";
import {
  SectionStrengthDisplay,
  type SectionStrengthDisplayProps,
} from "@/components/features/SectionStrengthDisplay";
import { InsightGeneratePrompt } from "@/components/features/InsightGeneratePrompt";

interface InsightDef {
  id: string;
  label: string;
  tab: "shared" | "jobseeker" | "business";
  render: () => React.ReactNode;
}

interface DashboardMatchResultsProps {
  score: MatchScoreDisplayProps;
  skillsBreakdown: SkillsBreakdownDisplayProps;
  actionItems: ActionItemsDisplayProps;
  topStrengths: TopStrengthsDisplayProps;
  atsKeywords: ATSKeywordDisplayProps;
  experienceAlignment: ExperienceAlignmentDisplayProps;
  qualificationFit?: QualificationFitDisplayProps;
  sectionStrength?: SectionStrengthDisplayProps;
  userType: string;
  tier: string;
  matchId?: string;
}

export function DashboardMatchResults({
  score,
  skillsBreakdown,
  actionItems,
  topStrengths,
  atsKeywords,
  experienceAlignment,
  qualificationFit,
  sectionStrength,
  userType,
  tier,
  matchId,
}: DashboardMatchResultsProps) {
  const isPro = tier === "pro";
  const defaultTab = userType === "business" ? "business" : "jobseeker";
  const showJobseekerTab = isPro || userType === "jobseeker";
  const showBusinessTab = isPro || userType === "business";

  const [generated, setGenerated] = useState<Record<string, unknown>>({});

  const onInsightGenerated = useCallback((insightId: string, data: unknown) => {
    setGenerated((prev) => ({ ...prev, [insightId]: data }));
  }, []);

  const resolvedQualificationFit =
    qualificationFit ??
    (generated.qualificationFit as QualificationFitDisplayProps | undefined);

  const resolvedSectionStrength =
    sectionStrength ??
    (generated.sectionStrength as SectionStrengthDisplayProps | undefined);

  function renderGenerateOrDisplay(
    insightId: string,
    icon: React.ReactNode,
    title: string,
    description: string,
    displayComponent: React.ReactNode | null
  ): React.ReactNode {
    if (displayComponent) return displayComponent;

    if (!matchId) return null;

    return (
      <InsightGeneratePrompt
        icon={icon}
        title={title}
        description={description}
        matchId={matchId}
        insightId={insightId}
        onGenerated={(data) => onInsightGenerated(insightId, data)}
      />
    );
  }

  const allInsights: InsightDef[] = [
    {
      id: "overallScore",
      label: "Overall Match Score",
      tab: "shared",
      render: () => <MatchScoreDisplay {...score} />,
    },
    {
      id: "skillsBreakdown",
      label: "Skills Breakdown",
      tab: "shared",
      render: () => <SkillsBreakdownDisplay {...skillsBreakdown} />,
    },
    {
      id: "actionItems",
      label: "Action Items",
      tab: "jobseeker",
      render: () => <ActionItemsDisplay {...actionItems} />,
    },
    {
      id: "topStrengths",
      label: "Top Strengths",
      tab: "business",
      render: () => <TopStrengthsDisplay {...topStrengths} />,
    },
    {
      id: "atsKeywords",
      label: "ATS Keywords",
      tab: "jobseeker",
      render: () => <ATSKeywordDisplay {...atsKeywords} />,
    },
    {
      id: "experienceAlignment",
      label: "Experience Alignment",
      tab: "shared",
      render: () => <ExperienceAlignmentDisplay {...experienceAlignment} />,
    },
    {
      id: "qualificationFit",
      label: "Qualification Fit",
      tab: "shared",
      render: () =>
        renderGenerateOrDisplay(
          "qualificationFit",
          <GraduationCap
            className="h-5 w-5 text-purple-500"
            aria-hidden="true"
          />,
          "Qualification Fit",
          "Evaluate how the candidate's qualifications match the job requirements.",
          resolvedQualificationFit ? (
            <QualificationFitDisplay {...resolvedQualificationFit} />
          ) : null
        ),
    },
    {
      id: "sectionStrength",
      label: "Section Strength",
      tab: "jobseeker",
      render: () =>
        renderGenerateOrDisplay(
          "sectionStrength",
          <BarChart3 className="h-5 w-5 text-indigo-500" aria-hidden="true" />,
          "Resume Section Strength",
          "Rate each resume section against this job and identify areas to improve.",
          resolvedSectionStrength ? (
            <SectionStrengthDisplay {...resolvedSectionStrength} />
          ) : null
        ),
    },
  ];

  const jobseekerInsights = allInsights.filter(
    (i) => i.tab === "shared" || i.tab === "jobseeker"
  );
  const businessInsights = allInsights.filter(
    (i) => i.tab === "shared" || i.tab === "business"
  );

  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeInsights = isPro
    ? allInsights
    : userType === "business"
      ? businessInsights
      : jobseekerInsights;
  const hiddenCount = [...hidden].filter((id) =>
    activeInsights.some((i) => i.id === id)
  ).length;

  function renderCards(insights: InsightDef[]) {
    const visible = insights.filter((i) => !hidden.has(i.id));
    return (
      <div className="columns-1 gap-6 lg:columns-2">
        {visible.map((insight) => (
          <Card
            key={insight.id}
            className="mb-6 min-w-0 break-inside-avoid overflow-hidden"
          >
            <CardContent>{insight.render()}</CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl rounded-lg p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">
          Insights and Analysis Results
        </h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {hiddenCount > 0 && (
                <span className="ml-1 rounded-full bg-[#6696C9] px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
                  {hiddenCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
              Show / Hide Insights
            </p>
            {activeInsights.map((i) => {
              const isVisible = !hidden.has(i.id);
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => toggle(i.id)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/50"
                >
                  {isVisible ? (
                    <Eye className="h-3.5 w-3.5 shrink-0 text-[#6696C9]" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  )}
                  <span
                    className={
                      isVisible
                        ? "font-medium text-foreground"
                        : "text-muted-foreground/50 line-through"
                    }
                  >
                    {i.label}
                  </span>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue={defaultTab}>
        {isPro && (
          <TabsList className="mx-auto mb-6 w-full max-w-md">
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
          <TabsContent value="jobseeker">
            {renderCards(jobseekerInsights)}
          </TabsContent>
        )}

        {showBusinessTab && (
          <TabsContent value="business">
            {renderCards(businessInsights)}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
