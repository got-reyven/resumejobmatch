import { Upload, FileSearch, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Resume",
    description:
      "Drag and drop your PDF or DOCX resume. We extract the text instantly — no account needed.",
  },
  {
    icon: FileSearch,
    title: "Add the Job Description",
    description:
      "Paste the full job description or drop in a public job listing URL. We parse it automatically.",
  },
  {
    icon: BarChart3,
    title: "Get Actionable Insights",
    description:
      "See your match score, skills breakdown, and specific steps to improve — all in seconds.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three steps. No signup required. Get real insights before you hit
            &ldquo;Apply.&rdquo;
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-4 px-4 sm:grid-cols-3 sm:gap-5 sm:px-5">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="flex flex-col items-center rounded-2xl bg-[#F5F5F5] px-6 py-10 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <step.icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="mt-4 text-sm font-semibold text-primary">
              Step {i + 1}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
