"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import {
  Briefcase,
  User,
  SlidersHorizontal,
  Eye,
  EyeOff,
  GraduationCap,
  BarChart3,
  FileText,
  AlertTriangle,
  MessageCircleQuestion,
  Scale,
  PenLine,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Heart,
  Clock,
  Mail,
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  Zap,
  Search,
  GitBranch,
  Users,
  DollarSign,
  Check,
  Download,
  type LucideIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  TailoredSummaryDisplay,
  type TailoredSummaryDisplayProps,
} from "@/components/features/TailoredSummaryDisplay";
import {
  RiskAreasDisplay,
  type RiskAreasDisplayProps,
} from "@/components/features/RiskAreasDisplay";
import {
  InterviewFocusDisplay,
  type InterviewFocusDisplayProps,
} from "@/components/features/InterviewFocusDisplay";
import {
  OverqualificationDisplay,
  type OverqualificationDisplayProps,
} from "@/components/features/OverqualificationDisplay";
import {
  RewriteSuggestionsDisplay,
  type RewriteSuggestionsDisplayProps,
} from "@/components/features/RewriteSuggestionsDisplay";
import {
  ResumeIntegrityDisplay,
  type ResumeIntegrityDisplayProps,
} from "@/components/features/ResumeIntegrityDisplay";
import {
  CompetitivePositioningDisplay,
  type CompetitivePositioningDisplayProps,
} from "@/components/features/CompetitivePositioningDisplay";
import {
  IndustryJargonDisplay,
  type IndustryJargonDisplayProps,
} from "@/components/features/IndustryJargonDisplay";
import {
  SoftSkillsDisplay,
  type SoftSkillsDisplayProps,
} from "@/components/features/SoftSkillsDisplay";
import {
  CareerGapDisplay,
  type CareerGapDisplayProps,
} from "@/components/features/CareerGapDisplay";
import {
  CoverLetterDisplay,
  type CoverLetterDisplayProps,
} from "@/components/features/CoverLetterDisplay";
import {
  SkillTransferabilityDisplay,
  type SkillTransferabilityDisplayProps,
} from "@/components/features/SkillTransferabilityDisplay";
import {
  CultureCommunicationDisplay,
  type CultureCommunicationDisplayProps,
} from "@/components/features/CultureCommunicationDisplay";
import {
  SalaryRangeDisplay,
  type SalaryRangeDisplayProps,
} from "@/components/features/SalaryRangeDisplay";
import { InsightGeneratePrompt } from "@/components/features/InsightGeneratePrompt";

const COLLAPSED_HEIGHT = 300;

function CollapsibleInsight({
  children,
  expanded,
  onToggle,
}: {
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const check = () =>
      setNeedsCollapse(el.scrollHeight > COLLAPSED_HEIGHT + 40);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{
          maxHeight:
            expanded || !needsCollapse ? "none" : `${COLLAPSED_HEIGHT}px`,
        }}
      >
        {children}
      </div>

      {needsCollapse && (
        <>
          {!expanded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-card" />
          )}
          <button
            type="button"
            onClick={onToggle}
            className="absolute top-0 right-0 z-10 flex items-center gap-1 rounded-full border border-[#6696C9] bg-[#B5DAF2]/30 px-2.5 py-0.5 text-[10px] font-medium text-foreground transition-colors hover:bg-[#B5DAF2]/50"
          >
            {expanded ? (
              <>
                Less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                More <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

interface InsightDef {
  id: string;
  label: string;
  icon: LucideIcon;
  iconClass: string;
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
  tailoredSummary?: TailoredSummaryDisplayProps;
  riskAreas?: RiskAreasDisplayProps;
  interviewFocus?: InterviewFocusDisplayProps;
  overqualification?: OverqualificationDisplayProps;
  rewriteSuggestions?: RewriteSuggestionsDisplayProps;
  resumeIntegrity?: ResumeIntegrityDisplayProps;
  competitivePositioning?: CompetitivePositioningDisplayProps;
  industryJargon?: IndustryJargonDisplayProps;
  softSkills?: SoftSkillsDisplayProps;
  careerGap?: CareerGapDisplayProps;
  coverLetter?: CoverLetterDisplayProps;
  skillTransferability?: SkillTransferabilityDisplayProps;
  cultureCommunication?: CultureCommunicationDisplayProps;
  salaryRange?: SalaryRangeDisplayProps;
  userType: string;
  tier: string;
  matchId?: string;
  detailBar?: React.ReactNode;
  isStuck?: boolean;
  headerContent?: React.ReactNode;
  sidebarHeader?: React.ReactNode;
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
  tailoredSummary,
  riskAreas,
  interviewFocus,
  overqualification,
  rewriteSuggestions,
  resumeIntegrity,
  competitivePositioning,
  industryJargon,
  softSkills,
  careerGap,
  coverLetter,
  skillTransferability,
  cultureCommunication,
  salaryRange,
  userType,
  tier,
  matchId,
  detailBar,
  isStuck,
  headerContent,
  sidebarHeader,
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

  const resolvedTailoredSummary =
    tailoredSummary ??
    (generated.tailoredSummary as TailoredSummaryDisplayProps | undefined);

  const resolvedRiskAreas =
    riskAreas ?? (generated.riskAreas as RiskAreasDisplayProps | undefined);

  const resolvedInterviewFocus =
    interviewFocus ??
    (generated.interviewFocus as InterviewFocusDisplayProps | undefined);

  const resolvedOverqualification =
    overqualification ??
    (generated.overqualification as OverqualificationDisplayProps | undefined);

  const resolvedRewriteSuggestions =
    rewriteSuggestions ??
    (generated.rewriteSuggestions as
      | RewriteSuggestionsDisplayProps
      | undefined);

  const resolvedResumeIntegrity =
    resumeIntegrity ??
    (generated.resumeIntegrity as ResumeIntegrityDisplayProps | undefined);

  const resolvedCompetitivePositioning =
    competitivePositioning ??
    (generated.competitivePositioning as
      | CompetitivePositioningDisplayProps
      | undefined);

  const resolvedIndustryJargon =
    industryJargon ??
    (generated.industryJargon as IndustryJargonDisplayProps | undefined);

  const resolvedSoftSkills =
    softSkills ?? (generated.softSkills as SoftSkillsDisplayProps | undefined);

  const resolvedCareerGap =
    careerGap ?? (generated.careerGap as CareerGapDisplayProps | undefined);

  const resolvedCoverLetter =
    coverLetter ??
    (generated.coverLetter as CoverLetterDisplayProps | undefined);

  const resolvedSkillTransferability =
    skillTransferability ??
    (generated.skillTransferability as
      | SkillTransferabilityDisplayProps
      | undefined);

  const resolvedCultureCommunication =
    cultureCommunication ??
    (generated.cultureCommunication as
      | CultureCommunicationDisplayProps
      | undefined);

  const resolvedSalaryRange =
    salaryRange ??
    (generated.salaryRange as SalaryRangeDisplayProps | undefined);

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
      icon: Target,
      iconClass: "text-[#6696C9]",
      tab: "shared",
      render: () => <MatchScoreDisplay {...score} />,
    },
    {
      id: "skillsBreakdown",
      label: "Skills Breakdown",
      icon: Search,
      iconClass: "text-orange-500",
      tab: "shared",
      render: () => <SkillsBreakdownDisplay {...skillsBreakdown} />,
    },
    {
      id: "actionItems",
      label: "Action Items",
      icon: Lightbulb,
      iconClass: "text-amber-500",
      tab: "jobseeker",
      render: () => <ActionItemsDisplay {...actionItems} />,
    },
    {
      id: "topStrengths",
      label: "Top Strengths",
      icon: Zap,
      iconClass: "text-emerald-500",
      tab: "business",
      render: () => <TopStrengthsDisplay {...topStrengths} />,
    },
    {
      id: "atsKeywords",
      label: "ATS Keywords",
      icon: FileText,
      iconClass: "text-blue-500",
      tab: "jobseeker",
      render: () => <ATSKeywordDisplay {...atsKeywords} />,
    },
    {
      id: "experienceAlignment",
      label: "Experience Alignment",
      icon: Briefcase,
      iconClass: "text-slate-500",
      tab: "shared",
      render: () => <ExperienceAlignmentDisplay {...experienceAlignment} />,
    },
    {
      id: "qualificationFit",
      label: "Qualification Fit",
      icon: GraduationCap,
      iconClass: "text-purple-500",
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
      icon: BarChart3,
      iconClass: "text-indigo-500",
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
    {
      id: "tailoredSummary",
      label: "Tailored Summary",
      icon: FileText,
      iconClass: "text-teal-500",
      tab: "jobseeker",
      render: () =>
        renderGenerateOrDisplay(
          "tailoredSummary",
          <FileText className="h-5 w-5 text-teal-500" aria-hidden="true" />,
          "Tailored Summary Suggestion",
          "Get an AI-optimized professional summary tailored to this specific job.",
          resolvedTailoredSummary ? (
            <TailoredSummaryDisplay
              {...resolvedTailoredSummary}
              isPro={isPro}
            />
          ) : null
        ),
    },
    {
      id: "rewriteSuggestions",
      label: "Rewrite Suggestions",
      icon: PenLine,
      iconClass: "text-rose-500",
      tab: "jobseeker",
      render: () =>
        renderGenerateOrDisplay(
          "rewriteSuggestions",
          <PenLine className="h-5 w-5 text-rose-500" aria-hidden="true" />,
          "Rewrite Suggestions",
          "Get AI-powered rewrites of your experience bullets using the job's language and power verbs.",
          resolvedRewriteSuggestions ? (
            <RewriteSuggestionsDisplay
              {...resolvedRewriteSuggestions}
              isPro={isPro}
            />
          ) : null
        ),
    },
    {
      id: "competitivePositioning",
      label: "Competitive Positioning",
      icon: TrendingUp,
      iconClass: "text-green-500",
      tab: "jobseeker",
      render: () =>
        renderGenerateOrDisplay(
          "competitivePositioning",
          <TrendingUp className="h-5 w-5 text-green-500" aria-hidden="true" />,
          "Competitive Positioning",
          "Estimate how you stack up against typical applicants based on requirement coverage analysis.",
          resolvedCompetitivePositioning ? (
            <CompetitivePositioningDisplay
              {...resolvedCompetitivePositioning}
              isPro={isPro}
            />
          ) : null
        ),
    },
    {
      id: "industryJargon",
      label: "Industry Jargon Check",
      icon: BookOpen,
      iconClass: "text-sky-500",
      tab: "jobseeker",
      render: () =>
        renderGenerateOrDisplay(
          "industryJargon",
          <BookOpen className="h-5 w-5 text-sky-500" aria-hidden="true" />,
          "Industry Jargon Check",
          "Identify industry-specific terminology from the job description and check if your resume uses the right vocabulary.",
          resolvedIndustryJargon ? (
            <IndustryJargonDisplay {...resolvedIndustryJargon} isPro={isPro} />
          ) : null
        ),
    },
    {
      id: "softSkills",
      label: "Soft Skills Alignment",
      icon: Heart,
      iconClass: "text-pink-400",
      tab: "shared",
      render: () =>
        renderGenerateOrDisplay(
          "softSkills",
          <Heart className="h-5 w-5 text-pink-400" aria-hidden="true" />,
          "Soft Skills Alignment",
          "Assess how well the resume demonstrates the soft skills this role requires — with behavioral evidence, not just keywords.",
          resolvedSoftSkills ? (
            <SoftSkillsDisplay {...resolvedSoftSkills} isPro={isPro} />
          ) : null
        ),
    },
    {
      id: "careerGap",
      label: "Career Gap Analysis",
      icon: Clock,
      iconClass: "text-violet-500",
      tab: "shared",
      render: () =>
        renderGenerateOrDisplay(
          "careerGap",
          <Clock className="h-5 w-5 text-violet-500" aria-hidden="true" />,
          "Career Gap Analysis",
          "Analyze employment timeline gaps with duration, context, and constructive framing for both jobseekers and hiring managers.",
          resolvedCareerGap ? (
            <CareerGapDisplay {...resolvedCareerGap} isPro={isPro} />
          ) : null
        ),
    },
    {
      id: "coverLetter",
      label: "Cover Letter Starter",
      icon: Mail,
      iconClass: "text-blue-400",
      tab: "jobseeker",
      render: () =>
        renderGenerateOrDisplay(
          "coverLetter",
          <Mail className="h-5 w-5 text-blue-400" aria-hidden="true" />,
          "Cover Letter Starter",
          "Generate a tailored cover letter based on your resume and the job description — ready to copy, paste, and send.",
          resolvedCoverLetter ? (
            <CoverLetterDisplay {...resolvedCoverLetter} isPro={isPro} />
          ) : null
        ),
    },
    {
      id: "riskAreas",
      label: "Risk Areas & Gaps",
      icon: AlertTriangle,
      iconClass: "text-red-400",
      tab: "business",
      render: () =>
        renderGenerateOrDisplay(
          "riskAreas",
          <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />,
          "Risk Areas & Gaps",
          "Identify where the candidate falls short of requirements, with severity and mitigation context.",
          resolvedRiskAreas ? (
            <RiskAreasDisplay {...resolvedRiskAreas} isPro={isPro} />
          ) : null
        ),
    },
    {
      id: "interviewFocus",
      label: "Interview Focus Points",
      icon: MessageCircleQuestion,
      iconClass: "text-violet-500",
      tab: "business",
      render: () =>
        renderGenerateOrDisplay(
          "interviewFocus",
          <MessageCircleQuestion
            className="h-5 w-5 text-violet-500"
            aria-hidden="true"
          />,
          "Interview Focus Points",
          "Generate targeted interview questions based on gaps identified in the match analysis.",
          resolvedInterviewFocus ? (
            <InterviewFocusDisplay {...resolvedInterviewFocus} isPro={isPro} />
          ) : null
        ),
    },
    {
      id: "overqualification",
      label: "Overqualification Assessment",
      icon: Scale,
      iconClass: "text-pink-500",
      tab: "business",
      render: () =>
        renderGenerateOrDisplay(
          "overqualification",
          <Scale className="h-5 w-5 text-pink-500" aria-hidden="true" />,
          "Overqualification Assessment",
          "Assess whether the candidate is significantly overqualified for this role, with indicators and recommendations.",
          resolvedOverqualification ? (
            <OverqualificationDisplay {...resolvedOverqualification} />
          ) : null
        ),
    },
    {
      id: "resumeIntegrity",
      label: "Resume Integrity Check",
      icon: ShieldCheck,
      iconClass: "text-sky-500",
      tab: "business",
      render: () =>
        renderGenerateOrDisplay(
          "resumeIntegrity",
          <ShieldCheck className="h-5 w-5 text-sky-500" aria-hidden="true" />,
          "Resume Integrity Check",
          "Scan the resume for prompt injection attacks, hidden instructions, and manipulation attempts.",
          resolvedResumeIntegrity ? (
            <ResumeIntegrityDisplay {...resolvedResumeIntegrity} />
          ) : null
        ),
    },
    {
      id: "skillTransferability",
      label: "Skill Transferability Map",
      icon: GitBranch,
      iconClass: "text-purple-500",
      tab: "business",
      render: () =>
        renderGenerateOrDisplay(
          "skillTransferability",
          <GitBranch className="h-5 w-5 text-purple-500" aria-hidden="true" />,
          "Skill Transferability Map",
          "Map the candidate's adjacent skills to missing requirements — showing how existing expertise transfers.",
          resolvedSkillTransferability ? (
            <SkillTransferabilityDisplay
              {...resolvedSkillTransferability}
              isPro={isPro}
            />
          ) : null
        ),
    },
    {
      id: "cultureCommunication",
      label: "Culture & Communication",
      icon: Users,
      iconClass: "text-teal-500",
      tab: "business",
      render: () =>
        renderGenerateOrDisplay(
          "cultureCommunication",
          <Users className="h-5 w-5 text-teal-500" aria-hidden="true" />,
          "Culture & Communication Indicators",
          "Analyze resume language patterns to surface working-style indicators — collaboration, leadership, and communication approach.",
          resolvedCultureCommunication ? (
            <CultureCommunicationDisplay
              {...resolvedCultureCommunication}
              isPro={isPro}
            />
          ) : null
        ),
    },
    {
      id: "salaryRange",
      label: "Salary Range Indicator",
      icon: DollarSign,
      iconClass: "text-green-500",
      tab: "business",
      render: () =>
        renderGenerateOrDisplay(
          "salaryRange",
          <DollarSign className="h-5 w-5 text-green-500" aria-hidden="true" />,
          "Salary Range Indicator",
          "Estimate a competitive salary range based on the candidate's experience, skills, and the role's market positioning.",
          resolvedSalaryRange ? (
            <SalaryRangeDisplay {...resolvedSalaryRange} isPro={isPro} />
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSelection, setExportSelection] = useState<Set<string>>(
    new Set()
  );
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleExpanded = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const scrollToInsight = useCallback((id: string) => {
    setActiveInsightId(id);
    setExpandedCards((prev) => new Set(prev).add(id));
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const toggle = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredInsights = isPro
    ? allInsights
    : userType === "business"
      ? businessInsights
      : jobseekerInsights;
  const hiddenCount = [...hidden].filter((id) =>
    filteredInsights.some((i) => i.id === id)
  ).length;

  const availableInsights = new Set<string>();
  const resolvedMap: Record<string, unknown> = {
    overallScore: score,
    skillsBreakdown: skillsBreakdown,
    actionItems: actionItems,
    topStrengths: topStrengths,
    atsKeywords: atsKeywords,
    experienceAlignment: experienceAlignment,
    qualificationFit: resolvedQualificationFit,
    sectionStrength: resolvedSectionStrength,
    tailoredSummary: resolvedTailoredSummary,
    riskAreas: resolvedRiskAreas,
    interviewFocus: resolvedInterviewFocus,
    overqualification: resolvedOverqualification,
    rewriteSuggestions: resolvedRewriteSuggestions,
    resumeIntegrity: resolvedResumeIntegrity,
    competitivePositioning: resolvedCompetitivePositioning,
    industryJargon: resolvedIndustryJargon,
    softSkills: resolvedSoftSkills,
    careerGap: resolvedCareerGap,
    coverLetter: resolvedCoverLetter,
    skillTransferability: resolvedSkillTransferability,
    cultureCommunication: resolvedCultureCommunication,
    salaryRange: resolvedSalaryRange,
  };
  for (const [key, val] of Object.entries(resolvedMap)) {
    if (val) availableInsights.add(key);
  }

  const openExportModal = (insights: InsightDef[]) => {
    const available = insights.filter((i) => availableInsights.has(i.id));
    setExportSelection(new Set(available.map((i) => i.id)));
    setShowExportModal(true);
  };

  const toggleExportItem = (id: string) => {
    setExportSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const selectedIds = [...exportSelection];
    const insightCards = selectedIds
      .map((id) => cardRefs.current[id])
      .filter(Boolean) as HTMLDivElement[];

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

    const cardHtml = insightCards
      .map((el) => {
        const clone = el.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("[style]").forEach((node) => {
          const htmlNode = node as HTMLElement;
          if (htmlNode.style.maxHeight) {
            htmlNode.style.maxHeight = "none";
          }
        });
        clone
          .querySelectorAll(".pointer-events-none")
          .forEach((node) => node.remove());
        clone.querySelectorAll("button").forEach((btn) => {
          const text = btn.textContent?.trim() ?? "";
          if (text === "More" || text === "Less") btn.remove();
        });
        return `<div style="margin-bottom:2rem;page-break-inside:avoid;">${clone.innerHTML}</div>`;
      })
      .join("");

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Insights Export</title>
<style>${styles}
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body class="bg-white p-8">
<h1 style="font-size:1.5rem;font-weight:bold;margin-bottom:1.5rem;">Insights & Analysis Report</h1>
${cardHtml}
</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
    setShowExportModal(false);
  };

  function renderSidebar(insights: InsightDef[]) {
    const visible = insights.filter((i) => !hidden.has(i.id));
    const hasAnyData = visible.some((i) => availableInsights.has(i.id));
    return (
      <div className="space-y-3">
        <nav className="space-y-0.5">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigate
          </p>
          {visible.map((insight) => {
            const Icon = insight.icon;
            const isActive = activeInsightId === insight.id;
            const hasData = availableInsights.has(insight.id);
            return (
              <button
                key={insight.id}
                type="button"
                onClick={() => scrollToInsight(insight.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                  isActive
                    ? "bg-[#6696C9]/10 font-semibold text-[#6696C9]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-[#6696C9]" : insight.iconClass
                  )}
                  aria-hidden="true"
                />
                <span className="truncate flex-1">{insight.label}</span>
                {hasData && (
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-[#6696C9]"
                    aria-label="Generated"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {hasAnyData && (
          <button
            type="button"
            onClick={() => openExportModal(insights)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#6696C9] bg-[#6696C9]/5 px-3 py-2 text-xs font-medium text-[#6696C9] transition-colors hover:bg-[#6696C9]/15 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Insights
          </button>
        )}
      </div>
    );
  }

  function renderCards(insights: InsightDef[]) {
    const visible = insights.filter((i) => !hidden.has(i.id));
    return (
      <div className="columns-1 gap-6 xl:columns-2">
        {visible.map((insight) => (
          <div
            key={insight.id}
            ref={(el) => {
              cardRefs.current[insight.id] = el;
            }}
            className="mb-6 break-inside-avoid"
          >
            <Card
              className={cn(
                "min-w-0 overflow-hidden transition-shadow duration-200",
                expandedCards.has(insight.id)
                  ? "border-foreground shadow-md"
                  : "",
                activeInsightId === insight.id ? "ring-2 ring-[#6696C9]/40" : ""
              )}
            >
              <CardContent>
                <CollapsibleInsight
                  expanded={expandedCards.has(insight.id)}
                  onToggle={() => toggleExpanded(insight.id)}
                >
                  {insight.render()}
                </CollapsibleInsight>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  const filterPopover = (
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
        {filteredInsights.map((i) => {
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
  );

  return (
    <div className="w-full">
      <Tabs defaultValue={defaultTab}>
        <div className="flex gap-6">
          {/* Left: Navigation sidebar — sticky as a whole */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-0 pt-3">
              {sidebarHeader}
              {isPro && (
                <TabsList className="mb-4 w-full">
                  <TabsTrigger
                    value="jobseeker"
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    Jobseeker
                  </TabsTrigger>
                  <TabsTrigger
                    value="business"
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    Business
                  </TabsTrigger>
                </TabsList>
              )}
              {showJobseekerTab && (
                <TabsContent value="jobseeker" className="mt-0">
                  {renderSidebar(jobseekerInsights)}
                </TabsContent>
              )}
              {showBusinessTab && (
                <TabsContent value="business" className="mt-0">
                  {renderSidebar(businessInsights)}
                </TabsContent>
              )}
            </div>
          </aside>

          {/* Right: Header + Detail bar (sticky) + title + insight cards */}
          <div className="min-w-0 flex-1">
            {headerContent}

            {/* Sticky detail bar: resume/JD dropdowns */}
            {detailBar && (
              <div
                className={cn(
                  "sticky top-0 z-20 -mx-6 bg-white px-6 pb-3 pt-3 lg:-mx-8 lg:px-8",
                  isStuck &&
                    "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-black/5 after:to-transparent"
                )}
              >
                {detailBar}
              </div>
            )}

            {/* Title + filter */}
            <div className="mb-6 mt-4 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">
                Insights and Analysis Results
              </h2>
              {filterPopover}
            </div>

            {/* Insight cards */}
            {showJobseekerTab && (
              <TabsContent value="jobseeker" className="mt-0">
                {renderCards(jobseekerInsights)}
              </TabsContent>
            )}
            {showBusinessTab && (
              <TabsContent value="business" className="mt-0">
                {renderCards(businessInsights)}
              </TabsContent>
            )}
          </div>
        </div>
      </Tabs>

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#6696C9]" />
              Export Insights
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Select which insights to include in your export.
          </p>
          <div className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
            {filteredInsights
              .filter((i) => availableInsights.has(i.id))
              .map((insight) => {
                const Icon = insight.icon;
                const checked = exportSelection.has(insight.id);
                return (
                  <button
                    key={insight.id}
                    type="button"
                    onClick={() => toggleExportItem(insight.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        checked
                          ? "border-[#6696C9] bg-[#6696C9]"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {checked && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <Icon
                      className={cn("h-4 w-4 shrink-0", insight.iconClass)}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{insight.label}</span>
                  </button>
                );
              })}
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={exportSelection.size === 0}
              onClick={handleExport}
              className="gap-2 bg-[#6696C9] hover:bg-[#5580b0]"
            >
              <Download className="h-3.5 w-3.5" />
              Export ({exportSelection.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
