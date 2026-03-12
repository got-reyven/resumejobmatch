"use client";

import { useEffect, useReducer } from "react";
import Image from "next/image";
import { Loader2, AlertCircle, Crown, User, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils/cn";

interface TeamMember {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: "owner" | "member";
  status: string;
  joinedAt: string | null;
}

interface TeamState {
  status: "loading" | "loaded" | "error";
  organizationName: string | null;
  members: TeamMember[];
}

type TeamAction =
  | {
      type: "loaded";
      organizationName: string | null;
      members: TeamMember[];
    }
  | { type: "error" };

function reducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case "loaded":
      return {
        status: "loaded",
        organizationName: action.organizationName,
        members: action.members,
      };
    case "error":
      return { ...state, status: "error" };
  }
}

export default function TeamPage() {
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    organizationName: null,
    members: [],
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/organization/members");
        if (!res.ok) {
          dispatch({ type: "error" });
          return;
        }
        const json = await res.json();
        dispatch({
          type: "loaded",
          organizationName: json.data.organizationName,
          members: json.data.members,
        });
      } catch {
        dispatch({ type: "error" });
      }
    }
    load();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading team...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Failed to load team. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            {state.organizationName
              ? `Manage members of ${state.organizationName}`
              : "Manage your team members"}
          </p>
        </div>
        <Button disabled className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
          <Badge variant="outline" className="ml-1 text-[10px]">
            Pro
          </Badge>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-[300px]">Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </TableBody>
      </Table>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Team invitations are available on the Business Pro plan.
      </p>
    </div>
  );
}

function MemberRow({ member }: { member: TeamMember }) {
  const displayName = member.fullName || member.email?.split("@")[0] || "User";
  const joinedDate = member.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={displayName}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {member.email && (
              <p className="truncate text-xs text-muted-foreground">
                {member.email}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            "gap-1 capitalize",
            member.role === "owner"
              ? "border-amber-200 text-amber-700"
              : "border-gray-200 text-gray-600"
          )}
        >
          {member.role === "owner" && <Crown className="h-3 w-3" />}
          {member.role}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            member.status === "active"
              ? "border-green-200 text-green-700"
              : "border-red-200 text-red-700"
          )}
        >
          {member.status}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {joinedDate}
      </TableCell>
    </TableRow>
  );
}
