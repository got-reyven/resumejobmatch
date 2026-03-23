"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ban,
  TrendingDown,
  Users,
  Bot,
  FileX,
  Clock,
  ArrowUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source: string;
  icon: LucideIcon;
  iconColor: string;
  solution: string;
}

const stats: Stat[] = [
  {
    target: 75,
    suffix: "%",
    label: "of resumes are rejected by ATS before a human ever sees them",
    source: "Jobscan, 2025",
    icon: Ban,
    iconColor: "text-red-500",
    solution:
      "Our ATS Keyword Analysis shows exactly which keywords your resume is missing so you pass the filter.",
  },
  {
    target: 97,
    suffix: "%",
    label:
      "of Fortune 500 companies use Applicant Tracking Systems to filter candidates",
    source: "Jobscan, 2025",
    icon: Bot,
    iconColor: "text-blue-500",
    solution:
      "We match your resume against the job description the same way an ATS does — then tell you how to beat it.",
  },
  {
    target: 46,
    suffix: "%",
    label:
      "of new hires are considered a poor fit within the first 18 months on the job",
    source: "Leadership IQ Study",
    icon: TrendingDown,
    iconColor: "text-amber-500",
    solution:
      "Our risk analysis and interview focus points help hiring managers identify fit gaps before making an offer.",
  },
  {
    target: 250,
    label: "resumes are received per corporate job opening on average",
    source: "Glassdoor",
    icon: Users,
    iconColor: "text-indigo-500",
    solution:
      "Hiring managers get instant structured scoring to surface top candidates from the pile in seconds.",
  },
  {
    target: 3,
    suffix: "%",
    label: "of applicants actually receive an interview invitation",
    source: "Harvard Business School, 2024",
    icon: FileX,
    iconColor: "text-rose-500",
    solution:
      "Our action items and rewrite suggestions give you a concrete plan to stand out from the other 97%.",
  },
  {
    target: 61,
    suffix: "%",
    label:
      "more likely to get interviews when resumes are tailored to the specific job",
    source: "TopResume",
    icon: Clock,
    iconColor: "text-green-500",
    solution:
      "We generate a tailored summary and skill recommendations specific to each job you apply for.",
  },
];

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);

      if (step >= steps) {
        current = target;
        clearInterval(timer);
      }

      setCount(current);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return { ref, count };
}

function StatCard({ stat }: { stat: Stat }) {
  const { ref, count } = useCountUp(stat.target);

  return (
    <div ref={ref} className="flex flex-col rounded-3xl bg-[#F5F5F5] p-7">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
          <stat.icon
            className={`h-5 w-5 ${stat.iconColor}`}
            aria-hidden="true"
          />
        </div>
        <span className="text-4xl font-bold tracking-tight">
          {stat.prefix}
          {count}
          {stat.suffix}
        </span>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        {stat.label}
      </p>
      <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
        {stat.source}
      </p>
      <div className="mt-4 rounded-2xl bg-[#B5DAF2]/30 px-4 py-3">
        <p className="text-xs leading-relaxed font-medium">{stat.solution}</p>
      </div>
    </div>
  );
}

interface PainPoint {
  audience: string;
  headline: string;
  problems: string[];
}

const painPoints: PainPoint[] = [
  {
    audience: "Job Seekers",
    headline: "Applying shouldn't feel like shouting into the void.",
    problems: [
      "You spend hours tailoring your resume, only to get auto-rejected by an ATS you never see.",
      "You have no idea which skills or keywords are missing — or even what the job actually requires.",
      'Generic feedback like "we went with another candidate" tells you nothing actionable.',
    ],
  },
  {
    audience: "Hiring Managers",
    headline: "Screening shouldn't mean guessing.",
    problems: [
      "You sift through hundreds of resumes manually, with no structured way to compare.",
      "Strong candidates get buried because their resume wording doesn't match your job description exactly.",
      "There's no quick way to see qualification gaps or prepare targeted interview questions.",
    ],
  },
];

export function PainPoints() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The Job Market Is Broken
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Both sides of the hiring process are struggling. The numbers tell
            the story.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {painPoints.map((point) => (
            <div
              key={point.audience}
              className="hero-box rounded-3xl p-6 sm:p-8"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                For {point.audience}
              </span>
              <h3 className="mt-2 text-xl font-bold leading-snug text-white">
                {point.headline}
              </h3>
              <ul className="mt-5 space-y-3">
                {point.problems.map((problem) => (
                  <li key={problem} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                    <span className="text-sm leading-relaxed text-white/80">
                      {problem}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-base font-semibold">
            Resume Job Match bridges the gap — giving both sides{" "}
            <span className="text-primary">
              clarity, speed, and actionable data.
            </span>
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 gap-2 rounded-full px-8 py-6 text-base"
          >
            <a href="#hero">
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              Try it now — for FREE!
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
