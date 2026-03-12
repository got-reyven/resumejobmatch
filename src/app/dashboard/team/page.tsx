"use client";

import { useEffect, useReducer, useState } from "react";
import Image from "next/image";
import {
  Loader2,
  AlertCircle,
  Crown,
  User,
  UserPlus,
  Clock,
  Mail,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface TeamState {
  status: "loading" | "loaded" | "error";
  organizationName: string | null;
  members: TeamMember[];
  invitations: PendingInvite[];
}

type TeamAction =
  | {
      type: "loaded";
      organizationName: string | null;
      members: TeamMember[];
      invitations: PendingInvite[];
    }
  | { type: "error" }
  | { type: "invitations_updated"; invitations: PendingInvite[] };

function reducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case "loaded":
      return {
        status: "loaded",
        organizationName: action.organizationName,
        members: action.members,
        invitations: action.invitations,
      };
    case "error":
      return { ...state, status: "error" };
    case "invitations_updated":
      return { ...state, invitations: action.invitations };
  }
}

export default function TeamPage() {
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    organizationName: null,
    members: [],
    invitations: [],
  });

  const loadData = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch("/api/v1/organization/members"),
        fetch("/api/v1/organization/invitations"),
      ]);

      if (!membersRes.ok) {
        dispatch({ type: "error" });
        return;
      }

      const membersJson = await membersRes.json();
      const invitesJson = invitesRes.ok
        ? await invitesRes.json()
        : { data: [] };

      dispatch({
        type: "loaded",
        organizationName: membersJson.data.organizationName,
        members: membersJson.data.members,
        invitations: invitesJson.data ?? [],
      });
    } catch {
      dispatch({ type: "error" });
    }
  };

  useEffect(() => {
    loadData();
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
        <InviteModal onInvitesSent={loadData} />
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
          {state.invitations.map((inv) => (
            <InvitationRow key={inv.id} invitation={inv} />
          ))}
        </TableBody>
      </Table>

      {state.members.length + state.invitations.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No team members yet. Invite your first team member above.
        </p>
      )}
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

function InvitationRow({ invitation }: { invitation: PendingInvite }) {
  const sentDate = new Date(invitation.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TableRow className="opacity-60">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{invitation.email}</p>
            <p className="text-xs text-muted-foreground">Invitation sent</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="capitalize border-gray-200 text-gray-600"
        >
          {invitation.role}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="gap-1 border-yellow-200 text-yellow-700"
        >
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        Sent {sentDate}
      </TableCell>
    </TableRow>
  );
}

function InviteModal({ onInvitesSent }: { onInvitesSent: () => void }) {
  const [open, setOpen] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    total: number;
    results: { email: string; status: string; message?: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emails = emailsText
    .split(/[,\n]/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  const validEmails = emails.filter((e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  );
  const hasInvalid = emails.length > 0 && validEmails.length < emails.length;

  const handleSend = async () => {
    if (validEmails.length === 0) return;
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/v1/organization/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: validEmails }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error?.message ?? "Failed to send invitations.");
        return;
      }

      const json = await res.json();
      setResult(json.data);
      onInvitesSent();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmailsText("");
    setResult(null);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Enter email addresses to invite (one per line or comma-separated).
            Up to 10 at a time.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                {result.sent} of {result.total} invitation
                {result.total > 1 ? "s" : ""} sent
              </p>
            </div>
            <div className="space-y-1.5">
              {result.results.map((r) => (
                <div
                  key={r.email}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{r.email}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-2 shrink-0 text-[10px]",
                      r.status === "sent"
                        ? "border-green-200 text-green-700"
                        : r.status === "already_invited"
                          ? "border-yellow-200 text-yellow-700"
                          : "border-red-200 text-red-700"
                    )}
                  >
                    {r.status === "sent"
                      ? "Sent"
                      : r.status === "already_invited"
                        ? "Already invited"
                        : (r.message ?? "Error")}
                  </Badge>
                </div>
              ))}
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                placeholder={
                  "alice@company.com\nbob@company.com\ncarol@company.com"
                }
                rows={5}
                disabled={sending}
                className={cn(
                  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none resize-none",
                  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  "placeholder:text-muted-foreground"
                )}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {validEmails.length} valid email
                  {validEmails.length !== 1 ? "s" : ""}
                  {validEmails.length > 10 && (
                    <span className="text-destructive"> (max 10)</span>
                  )}
                </span>
                {hasInvalid && (
                  <span className="text-destructive">
                    Some emails are invalid
                  </span>
                )}
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              onClick={handleSend}
              disabled={
                validEmails.length === 0 || validEmails.length > 10 || sending
              }
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${validEmails.length > 0 ? validEmails.length : ""} Invitation${validEmails.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
