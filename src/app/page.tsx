import { FileText, Zap, Target } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Resume Job Match
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Know exactly how you match — before you apply.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-lg border p-6">
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="font-semibold">Upload Resume</h2>
            <p className="text-sm text-muted-foreground">
              PDF or DOCX — we extract the content automatically
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-lg border p-6">
            <Target className="h-8 w-8 text-primary" />
            <h2 className="font-semibold">Paste Job Description</h2>
            <p className="text-sm text-muted-foreground">
              Paste text or a job URL — we handle the rest
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-lg border p-6">
            <Zap className="h-8 w-8 text-primary" />
            <h2 className="font-semibold">Get Insights</h2>
            <p className="text-sm text-muted-foreground">
              Actionable breakdown of your match in seconds
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Project setup complete. Development server is running.
        </p>
      </div>
    </main>
  );
}
