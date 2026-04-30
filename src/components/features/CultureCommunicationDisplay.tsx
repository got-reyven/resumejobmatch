"use client";

import Link from "next/link";
import { Users, Lock, Crown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CultureCommunicationDisplayProps {
  indicators: {
    dimension: string;
    signal: string;
    evidence: string;
  }[];
  communication_style: string;
  disclaimer: string;
  isPro?: boolean;
}

export function CultureCommunicationDisplay({
  indicators,
  communication_style,
  disclaimer,
  isPro = false,
}: CultureCommunicationDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-teal-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">
          Culture & Communication Indicators
        </h3>
      </div>

      {/* Communication style summary */}
      <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4">
        <p className="text-sm font-semibold text-foreground">
          Communication Profile
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {communication_style}
        </p>
      </div>

      {/* Indicators table */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2 text-left">Dimension</th>
              <th className="w-[140px] px-3 py-2 text-left">Signal</th>
              {isPro && <th className="px-3 py-2 text-left">Evidence</th>}
            </tr>
          </thead>
          <tbody>
            {indicators.map((ind, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="px-3 py-2.5 align-top font-medium">
                  {ind.dimension}
                </td>
                <td className="px-3 py-2.5 align-top">
                  <span className="inline-block rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700">
                    {ind.signal}
                  </span>
                </td>
                {isPro && (
                  <td className="px-3 py-2.5 align-top text-xs leading-relaxed text-muted-foreground">
                    {ind.evidence}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pro gate CTA */}
      {!isPro && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Upgrade to Business Pro for evidence details
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                See the specific resume language and patterns behind each
                indicator — helping you prepare targeted interview
                conversations.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-2.5 gap-1.5 bg-amber-600 text-xs hover:bg-amber-700"
              >
                <Link href="/pricing">
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Info
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
          aria-hidden="true"
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground italic">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
