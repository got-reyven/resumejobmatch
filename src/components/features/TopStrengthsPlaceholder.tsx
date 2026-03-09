import { Award } from "lucide-react";

export function TopStrengthsPlaceholder() {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 text-lg font-semibold">Top Strengths</h3>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/20 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Award className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-muted-foreground">Coming Soon</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Top 3 areas where the candidate exceeds or strongly meets
            requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
