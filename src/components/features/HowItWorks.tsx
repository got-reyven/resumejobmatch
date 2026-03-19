import Image from "next/image";

const steps = [
  {
    number: 1,
    title: "Upload Your Resume",
    description:
      "Drag and drop your PDF or DOCX resume. We extract the text instantly — no account needed.",
    illustration: "/01-upload-resume.svg",
  },
  {
    number: 2,
    title: "Add the Job Description",
    description:
      "Paste the full job description or drop in a public job listing URL. We parse it automatically.",
    illustration: "/02-add-job-description.svg",
  },
  {
    number: 3,
    title: "Get Actionable Insights",
    description:
      "See your match score, skills breakdown, and specific steps to improve — all in seconds.",
    illustration: "/03-actionable-insights.svg",
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

      <div className="mt-14 grid gap-6 px-4 sm:grid-cols-3 sm:gap-8 sm:px-5">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative overflow-hidden rounded-3xl bg-[#F5F5F5]"
          >
            <div className="flex h-44 items-end justify-end px-8 pt-8">
              <Image
                src={step.illustration}
                alt=""
                width={140}
                height={120}
                className="object-contain"
                aria-hidden="true"
              />
            </div>

            <div className="px-8 pb-10 pt-6">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
