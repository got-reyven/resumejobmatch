"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightGeneratePromptProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  matchId: string;
  insightId: string;
  onGenerated: (data: unknown) => void;
}

export function InsightGeneratePrompt({
  icon,
  title,
  description,
  matchId,
  insightId,
  onGenerated,
}: InsightGeneratePromptProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/v1/matches/${matchId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error?.message ?? "Failed to generate insight.");
        setStatus("error");
        return;
      }

      onGenerated(json.data);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
      <div className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </div>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>

      {status === "error" && errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={handleGenerate}
        disabled={status === "loading"}
        className="gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {status === "error" ? "Retry" : "Generate"}
          </>
        )}
      </Button>
    </div>
  );
}
