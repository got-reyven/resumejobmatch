import {
  Ban,
  Clock,
  Eye,
  FileX,
  Users,
  Bot,
  type LucideIcon,
} from "lucide-react";

interface Stat {
  value: string;
  label: string;
  source: string;
  icon: LucideIcon;
  iconColor: string;
}

const stats: Stat[] = [
  {
    value: "75%",
    label: "of resumes are rejected by ATS before a human ever sees them",
    source: "Jobscan, 2025",
    icon: Ban,
    iconColor: "text-red-500",
  },
  {
    value: "97%",
    label:
      "of Fortune 500 companies use Applicant Tracking Systems to filter candidates",
    source: "Jobscan, 2025",
    icon: Bot,
    iconColor: "text-blue-500",
  },
  {
    value: "7.4s",
    label:
      "is the average time a recruiter spends on their initial resume review",
    source: "Ladders Inc. Eye-Tracking Study",
    icon: Eye,
    iconColor: "text-amber-500",
  },
  {
    value: "250",
    label: "resumes are received per corporate job opening on average",
    source: "Glassdoor",
    icon: Users,
    iconColor: "text-indigo-500",
  },
  {
    value: "2-3%",
    label: "of applicants actually receive an interview invitation",
    source: "Harvard Business School, 2024",
    icon: FileX,
    iconColor: "text-rose-500",
  },
  {
    value: "61%",
    label:
      "more likely to get interviews when resumes are tailored to the specific job",
    source: "TopResume",
    icon: Clock,
    iconColor: "text-green-500",
  },
];

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

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col rounded-xl border bg-background p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <stat.icon
                    className={`h-5 w-5 ${stat.iconColor}`}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                {stat.source}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {painPoints.map((point) => (
            <div key={point.audience} className="rounded-xl border p-6 sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                For {point.audience}
              </span>
              <h3 className="mt-2 text-xl font-bold leading-snug">
                {point.headline}
              </h3>
              <ul className="mt-5 space-y-3">
                {point.problems.map((problem) => (
                  <li key={problem} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    <span className="text-sm leading-relaxed text-muted-foreground">
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
        </div>
      </div>
    </section>
  );
}
