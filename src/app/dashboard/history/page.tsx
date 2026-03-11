"use client";

import { useEffect, useReducer, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MatchItem {
  id: string;
  overallScore: number;
  resumeFileName: string;
  candidateName: string | null;
  jobTitle: string | null;
  jobCompany: string | null;
  jobSourceUrl: string | null;
  createdAt: string;
}

interface HistoryState {
  items: MatchItem[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  status: "idle" | "loading" | "loaded" | "error";
  deletingId: string | null;
}

type HistoryAction =
  | { type: "set_query"; query: string }
  | { type: "set_page"; page: number }
  | { type: "loading" }
  | {
      type: "loaded";
      items: MatchItem[];
      total: number;
      page: number;
      pageSize: number;
    }
  | { type: "error" }
  | { type: "deleting"; id: string }
  | { type: "deleted"; id: string };

function reducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "set_query":
      return { ...state, query: action.query, page: 1 };
    case "set_page":
      return { ...state, page: action.page };
    case "loading":
      return { ...state, status: "loading" };
    case "loaded":
      return {
        ...state,
        status: "loaded",
        items: action.items,
        total: action.total,
        page: action.page,
        pageSize: action.pageSize,
      };
    case "error":
      return { ...state, status: "error" };
    case "deleting":
      return { ...state, deletingId: action.id };
    case "deleted":
      return {
        ...state,
        deletingId: null,
        items: state.items.filter((i) => i.id !== action.id),
        total: state.total - 1,
      };
  }
}

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    query: "",
    status: "idle",
    deletingId: null,
  });

  const fetchHistory = useCallback(async (page: number, query: string) => {
    dispatch({ type: "loading" });
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (query) params.set("q", query);

      const res = await fetch(`/api/v1/matches/history?${params}`);
      if (!res.ok) {
        dispatch({ type: "error" });
        return;
      }

      const json = await res.json();
      dispatch({
        type: "loaded",
        items: json.data,
        total: json.meta.total,
        page: json.meta.page,
        pageSize: json.meta.pageSize,
      });
    } catch {
      dispatch({ type: "error" });
    }
  }, []);

  useEffect(() => {
    fetchHistory(state.page, state.query);
  }, [state.page, state.query, fetchHistory]);

  const handleDelete = async (id: string) => {
    dispatch({ type: "deleting", id });
    try {
      await fetch(`/api/v1/matches/${id}`, { method: "DELETE" });
      dispatch({ type: "deleted", id });
    } catch {
      dispatch({ type: "deleting", id: "" });
    }
  };

  const totalPages = Math.ceil(state.total / state.pageSize);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Match History</h1>
        <p className="text-sm text-muted-foreground">
          View and revisit your past resume match results.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by job title, company, or resume..."
            className="pl-9"
            value={state.query}
            onChange={(e) =>
              dispatch({ type: "set_query", query: e.target.value })
            }
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {state.total} {state.total === 1 ? "match" : "matches"}
        </span>
      </div>

      {state.status === "loading" && state.items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading history...</p>
        </div>
      )}

      {state.status === "error" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load history. Please refresh.
            </p>
          </CardContent>
        </Card>
      )}

      {state.status === "loaded" && state.items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No matches yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {state.query
                  ? "No matches found for your search. Try different keywords."
                  : "Run your first match to see it here."}
              </p>
            </div>
            {!state.query && (
              <Button asChild>
                <Link href="/dashboard/match">Start a New Match</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {state.items.length > 0 && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Job Seeker</TableHead>
                <TableHead className="w-[30%]">Job Description</TableHead>
                <TableHead className="w-[12%] text-center">
                  Overall Score
                </TableHead>
                <TableHead className="w-[15%]">Date</TableHead>
                <TableHead className="w-[18%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.items.map((item) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  isDeleting={state.deletingId === item.id}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={state.page <= 1}
            onClick={() => dispatch({ type: "set_page", page: state.page - 1 })}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {state.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={state.page >= totalPages}
            onClick={() => dispatch({ type: "set_page", page: state.page + 1 })}
            className="gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function HistoryRow({
  item,
  isDeleting,
  onDelete,
}: {
  item: MatchItem;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}) {
  const scoreColor =
    item.overallScore >= 75
      ? "text-green-600"
      : item.overallScore >= 50
        ? "text-amber-600"
        : "text-red-500";

  const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = new Date(item.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const candidateDisplay =
    (item.candidateName as string) ||
    item.resumeFileName.replace(/\.[^.]+$/, "");
  const jobDisplay = item.jobTitle ?? "Untitled Position";

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{candidateDisplay}</p>
        <p className="text-xs text-muted-foreground">{item.resumeFileName}</p>
      </TableCell>
      <TableCell>
        <p className="font-medium">{jobDisplay}</p>
        {item.jobSourceUrl ? (
          <a
            href={item.jobSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs text-[#6696C9] hover:underline"
          >
            {item.jobSourceUrl}
          </a>
        ) : item.jobCompany ? (
          <p className="text-xs text-muted-foreground">{item.jobCompany}</p>
        ) : null}
      </TableCell>
      <TableCell className="text-center">
        <span className={`text-base font-bold tabular-nums ${scoreColor}`}>
          {item.overallScore}%
        </span>
      </TableCell>
      <TableCell>
        <p className="text-sm">{dateStr}</p>
        <p className="text-xs text-muted-foreground">{timeStr}</p>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[#6696C9] hover:text-[#5580b0] hover:bg-[#B5DAF2]/20"
          >
            <Link href={`/dashboard/match/${item.id}`}>
              <Eye className="h-3.5 w-3.5" />
              View Insights
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label="Remove match"
            disabled={isDeleting}
            onClick={() => onDelete(item.id)}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
