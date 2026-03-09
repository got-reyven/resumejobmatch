"use client";

import { useState } from "react";
import {
  Target,
  Puzzle,
  Lightbulb,
  Trophy,
  Search,
  Briefcase,
  GraduationCap,
  LayoutList,
  FileText,
  AlertTriangle,
  MessageCircleQuestion,
  Scale,
  PenLine,
  TrendingUp,
  BookOpen,
  Heart,
  CalendarClock,
  Mail,
  GitBranch,
  Users,
  BarChart3,
  DollarSign,
  ClipboardCheck,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Access = "everyone" | "registered" | "pro";
type Audience = "jobseeker" | "hiring_manager" | "both";

interface Insight {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  audience: Audience;
  access: Access;
  available: boolean;
}

const basicInsights: Insight[] = [
  {
    id: 1,
    name: "Overall Match Score",
    description:
      "Weighted percentage score across skills, experience, qualifications, and overall fit — displayed as a ring gauge.",
    icon: Target,
    iconColor: "text-primary",
    audience: "both",
    access: "everyone",
    available: true,
  },
  {
    id: 2,
    name: "Skills Match Breakdown",
    description:
      "Color-coded matched vs. missing skills with exact and semantic match detection.",
    icon: Puzzle,
    iconColor: "text-blue-500",
    audience: "both",
    access: "everyone",
    available: true,
  },
  {
    id: 3,
    name: "Top 3 Action Items",
    description:
      "AI-prioritized list of the 3 most impactful changes to improve your match score.",
    icon: Lightbulb,
    iconColor: "text-yellow-500",
    audience: "jobseeker",
    access: "everyone",
    available: true,
  },
  {
    id: 4,
    name: "Top Strengths",
    description:
      "Top areas where the candidate exceeds or strongly meets the job requirements.",
    icon: Trophy,
    iconColor: "text-amber-500",
    audience: "hiring_manager",
    access: "everyone",
    available: true,
  },
];

const advancedInsights: Insight[] = [
  {
    id: 5,
    name: "ATS Keyword Analysis",
    description:
      "Critical keywords from the job description — present vs. missing in your resume. Actionable keyword suggestions.",
    icon: Search,
    iconColor: "text-orange-500",
    audience: "jobseeker",
    access: "registered",
    available: false,
  },
  {
    id: 6,
    name: "Experience Alignment",
    description:
      "Maps your roles to job requirements — years of relevant experience, seniority fit, and industry alignment.",
    icon: Briefcase,
    iconColor: "text-indigo-500",
    audience: "both",
    access: "registered",
    available: false,
  },
  {
    id: 7,
    name: "Qualification Fit",
    description:
      "Maps required and preferred qualifications (degree, certifications) to your resume.",
    icon: GraduationCap,
    iconColor: "text-emerald-500",
    audience: "both",
    access: "registered",
    available: false,
  },
  {
    id: 8,
    name: "Resume Section Strength",
    description:
      "Rates each resume section on how well it serves this specific job. Highlights the weakest section.",
    icon: LayoutList,
    iconColor: "text-cyan-500",
    audience: "jobseeker",
    access: "registered",
    available: false,
  },
  {
    id: 9,
    name: "Tailored Summary Suggestion",
    description:
      "AI-generated professional summary rewritten and optimized for the specific job description.",
    icon: FileText,
    iconColor: "text-teal-500",
    audience: "jobseeker",
    access: "registered",
    available: false,
  },
  {
    id: 10,
    name: "Risk Areas & Gaps",
    description:
      "Where the candidate falls short — framed constructively with transferability context.",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    audience: "hiring_manager",
    access: "registered",
    available: false,
  },
  {
    id: 11,
    name: "Interview Focus Points",
    description:
      "AI-generated questions tailored to probe specific gaps identified in the match analysis.",
    icon: MessageCircleQuestion,
    iconColor: "text-violet-500",
    audience: "hiring_manager",
    access: "registered",
    available: false,
  },
  {
    id: 12,
    name: "Overqualification Assessment",
    description:
      "Flags if the candidate appears significantly overqualified — with context for discussion.",
    icon: Scale,
    iconColor: "text-pink-500",
    audience: "hiring_manager",
    access: "registered",
    available: false,
  },
  {
    id: 13,
    name: "Rewrite Suggestions",
    description:
      "Bullet-by-bullet AI suggestions to rephrase experience items using the job's language and power verbs.",
    icon: PenLine,
    iconColor: "text-rose-500",
    audience: "jobseeker",
    access: "pro",
    available: false,
  },
  {
    id: 14,
    name: "Competitive Positioning",
    description:
      "Estimates how you stack up against typical applicants based on requirement coverage analysis.",
    icon: TrendingUp,
    iconColor: "text-green-500",
    audience: "jobseeker",
    access: "pro",
    available: false,
  },
  {
    id: 15,
    name: "Industry Jargon Check",
    description:
      "Industry-specific terminology your resume should use but doesn't.",
    icon: BookOpen,
    iconColor: "text-sky-500",
    audience: "jobseeker",
    access: "pro",
    available: false,
  },
  {
    id: 16,
    name: "Soft Skills Alignment",
    description:
      "Extracts soft skill requirements and checks if the resume demonstrates them.",
    icon: Heart,
    iconColor: "text-pink-400",
    audience: "both",
    access: "pro",
    available: false,
  },
  {
    id: 17,
    name: "Career Gap Analysis",
    description:
      "Identifies employment timeline gaps with suggestions on how to address them.",
    icon: CalendarClock,
    iconColor: "text-slate-500",
    audience: "both",
    access: "pro",
    available: false,
  },
  {
    id: 18,
    name: "Cover Letter Starter",
    description:
      "AI-generated tailored cover letter opening paragraph based on the match analysis.",
    icon: Mail,
    iconColor: "text-blue-400",
    audience: "jobseeker",
    access: "pro",
    available: false,
  },
  {
    id: 19,
    name: "Skill Transferability Map",
    description:
      "For skills the candidate lacks but has adjacent experience in — showing transferability potential.",
    icon: GitBranch,
    iconColor: "text-purple-500",
    audience: "hiring_manager",
    access: "pro",
    available: false,
  },
  {
    id: 20,
    name: "Culture & Communication Indicators",
    description:
      "Analyzes resume writing style for collaborative language, leadership framing, and technical depth.",
    icon: Users,
    iconColor: "text-fuchsia-500",
    audience: "hiring_manager",
    access: "pro",
    available: false,
  },
  {
    id: 21,
    name: "Comparison Matrix",
    description:
      "Side-by-side ranking of multiple resumes against the same job with per-requirement scores.",
    icon: BarChart3,
    iconColor: "text-orange-400",
    audience: "hiring_manager",
    access: "pro",
    available: false,
  },
  {
    id: 22,
    name: "Salary Range Indicator",
    description:
      "Market-informed salary range estimate based on experience level, skills, and seniority.",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    audience: "hiring_manager",
    access: "pro",
    available: false,
  },
  {
    id: 23,
    name: "Structured Evaluation Report",
    description:
      "Exportable PDF with all insights formatted as a professional evaluation document.",
    icon: ClipboardCheck,
    iconColor: "text-indigo-400",
    audience: "hiring_manager",
    access: "pro",
    available: false,
  },
];

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-background p-5 transition-shadow",
        insight.available
          ? "ring-1 ring-primary/20 hover:shadow-md"
          : "opacity-50"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
          <insight.icon
            className={cn("h-8 w-8", insight.iconColor)}
            aria-hidden="true"
          />
        </div>
        {insight.access === "pro" && (
          <Crown
            className="h-5 w-5 shrink-0 text-amber-500"
            aria-label="Pro plan"
          />
        )}
      </div>

      <h3 className="text-sm font-semibold leading-snug">{insight.name}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
        {insight.description}
      </p>
    </div>
  );
}

type Filter = "all" | Access;

const allInsights = [...basicInsights, ...advancedInsights];

const filterTabs: { value: Filter; label: string; dot: string }[] = [
  { value: "all", label: "All Insights", dot: "bg-foreground/60" },
  { value: "everyone", label: "Free for Everyone", dot: "bg-green-500" },
  { value: "registered", label: "Free Registered", dot: "bg-blue-500" },
  { value: "pro", label: "Pro Plan ($99/mo)", dot: "bg-purple-500" },
];

export function InsightsShowcase() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? allInsights
      : allInsights.filter((i) => i.access === filter);

  return (
    <section id="insights" className="border-t py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Limitless AI-Powered Insights
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Go beyond a simple score. Get deep, actionable analysis tailored for
            both jobseekers and hiring managers.
          </p>
        </div>

        <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  filter === tab.value ? "bg-primary-foreground" : tab.dot
                )}
              />
              {tab.label}
              <span
                className={cn(
                  "ml-0.5 text-xs",
                  filter === tab.value
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground/60"
                )}
              >
                {tab.value === "all"
                  ? allInsights.length
                  : allInsights.filter((i) => i.access === tab.value).length}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </section>
  );
}
