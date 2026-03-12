"use client";

import { useEffect, useReducer } from "react";
import { BarChart3, Loader2 } from "lucide-react";

interface DayStat {
  date: string;
  count: number;
}

type Range = 7 | 30;

interface ChartState {
  range: Range;
  data: DayStat[];
  status: "loading" | "loaded" | "error";
}

type ChartAction =
  | { type: "set_range"; range: Range }
  | { type: "loaded"; data: DayStat[] }
  | { type: "error" };

function reducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case "set_range":
      return { ...state, range: action.range, status: "loading" };
    case "loaded":
      return { ...state, data: action.data, status: "loaded" };
    case "error":
      return { ...state, status: "error" };
  }
}

function formatLabel(dateStr: string, range: Range): string {
  const d = new Date(dateStr + "T00:00:00");
  if (range === 7) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getYTicks(max: number): number[] {
  if (max <= 1) return [0, 1];
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i);
  const step = Math.ceil(max / 4);
  const ticks: number[] = [];
  for (let i = 0; i <= max; i += step) ticks.push(i);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

const BAR_COLOR = "#6696C9";
const CHART_HEIGHT = 160;

export function UsageChart() {
  const [state, dispatch] = useReducer(reducer, {
    range: 7,
    data: [],
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/matches/stats?range=${state.range}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.data) {
          dispatch({ type: "loaded", data: json.data });
        }
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [state.range]);

  const total = state.data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...state.data.map((d) => d.count), 1);
  const yTicks = getYTicks(maxCount);

  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Daily Usage</h2>
          {state.status === "loaded" && (
            <span className="text-xs text-muted-foreground">
              {total} {total === 1 ? "match" : "matches"} total
            </span>
          )}
        </div>
        <div className="flex rounded-lg border bg-muted/40 p-0.5">
          <button
            onClick={() => dispatch({ type: "set_range", range: 7 })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              state.range === 7
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => dispatch({ type: "set_range", range: 30 })}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              state.range === 30
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {state.status === "loading" && (
        <div
          className="flex items-center justify-center text-muted-foreground"
          style={{ height: CHART_HEIGHT + 28 }}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {state.status === "error" && (
        <div
          className="flex items-center justify-center text-sm text-muted-foreground"
          style={{ height: CHART_HEIGHT + 28 }}
        >
          Failed to load usage data
        </div>
      )}

      {state.status === "loaded" && (
        <div className="flex gap-2">
          {/* Y-axis labels */}
          <div
            className="flex shrink-0 flex-col justify-between py-0"
            style={{ height: CHART_HEIGHT, width: 28 }}
          >
            {[...yTicks].reverse().map((tick) => (
              <span
                key={tick}
                className="text-right text-[10px] leading-none text-muted-foreground"
              >
                {tick}
              </span>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 overflow-hidden">
            <div
              className="relative flex items-end gap-px"
              style={{ height: CHART_HEIGHT }}
            >
              {/* Horizontal grid lines */}
              {yTicks.map((tick) => (
                <div
                  key={`grid-${tick}`}
                  className="pointer-events-none absolute left-0 right-0 border-t border-gray-100"
                  style={{
                    bottom: `${(tick / maxCount) * 100}%`,
                  }}
                />
              ))}

              {state.data.map((d) => {
                const pct =
                  d.count > 0 ? Math.max((d.count / maxCount) * 100, 2) : 0;

                return (
                  <div
                    key={d.date}
                    className="group relative flex flex-1 flex-col items-center justify-end"
                    style={{ height: "100%" }}
                  >
                    {/* Count label above bar */}
                    {d.count > 0 && (
                      <span className="mb-1 text-[10px] font-medium text-foreground">
                        {d.count}
                      </span>
                    )}
                    {/* Bar */}
                    <div
                      className="w-full max-w-[32px] rounded-t-sm transition-opacity group-hover:opacity-80"
                      style={{
                        height: d.count > 0 ? `${pct}%` : "2px",
                        backgroundColor: d.count > 0 ? BAR_COLOR : "#e5e7eb",
                        minHeight: d.count > 0 ? 4 : 2,
                      }}
                      title={`${d.date}: ${d.count} ${d.count === 1 ? "match" : "matches"}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="mt-1.5 flex gap-px">
              {state.data.map((d, i) => {
                const showLabel =
                  state.range === 7 ||
                  i % 3 === 0 ||
                  i === state.data.length - 1;
                return (
                  <div
                    key={d.date}
                    className="flex-1 text-center text-[10px] text-muted-foreground"
                  >
                    {showLabel ? formatLabel(d.date, state.range) : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
