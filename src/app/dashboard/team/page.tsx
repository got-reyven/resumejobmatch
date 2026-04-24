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
  X,
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
    <div className="p-6 lg:p-8">
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InviteModal({ onInvitesSent }: { onInvitesSent: () => void }) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    total: number;
    results: { email: string; status: string; message?: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addEmail(raw: string) {
    const email = raw.trim().toLowerCase();
    if (!email) return;

    if (!EMAIL_REGEX.test(email)) {
      setInputError("Invalid email address");
      return;
    }

    if (emails.includes(email)) {
      setInputError("Already added");
      return;
    }

    if (emails.length >= 10) {
      setInputError("Maximum 10 emails");
      return;
    }

    setEmails((prev) => [...prev, email]);
    setInputValue("");
    setInputError(null);
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(inputValue);
    }

    if (e.key === "Backspace" && inputValue === "" && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const pasted = text.split(/[,\n\s]+/).filter(Boolean);

    const newEmails: string[] = [];
    for (const raw of pasted) {
      const email = raw.trim().toLowerCase();
      if (
        EMAIL_REGEX.test(email) &&
        !emails.includes(email) &&
        !newEmails.includes(email) &&
        emails.length + newEmails.length < 10
      ) {
        newEmails.push(email);
      }
    }

    if (newEmails.length > 0) {
      setEmails((prev) => [...prev, ...newEmails]);
      setInputValue("");
      setInputError(null);
    }
  }

  const handleSend = async () => {
    if (emails.length === 0) return;
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/v1/organization/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
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
    setEmails([]);
    setInputValue("");
    setInputError(null);
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
            Type an email and press{" "}
            <kbd className="rounded border px-1 py-0.5 text-[10px] font-mono">
              Enter
            </kbd>{" "}
            or{" "}
            <kbd className="rounded border px-1 py-0.5 text-[10px] font-mono">
              ,
            </kbd>{" "}
            to add. Up to 10 at a time.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                {result.sent} of {result.total} invitation
                {result.total > 1 ? "s" : ""} sent
              </p>
            </div>
            <div className="space-y-2">
              {result.results.map((r) => (
                <div key={r.email} className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm">{r.email}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px]",
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
                          : "Error"}
                    </Badge>
                  </div>
                  {r.status === "error" && r.message && (
                    <p className="text-xs text-destructive break-words">
                      {r.message}
                    </p>
                  )}
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
              <div
                className={cn(
                  "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-2",
                  "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
                )}
              >
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="rounded-full p-0.5 hover:bg-primary/20"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="email"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setInputError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  onBlur={() => {
                    if (inputValue.trim()) addEmail(inputValue);
                  }}
                  placeholder={emails.length === 0 ? "name@company.com" : ""}
                  disabled={sending || emails.length >= 10}
                  className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {emails.length} email{emails.length !== 1 ? "s" : ""} added
                  {emails.length >= 10 && (
                    <span className="text-destructive"> (max reached)</span>
                  )}
                </span>
                {inputError && (
                  <span className="text-destructive">{inputError}</span>
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
              disabled={emails.length === 0 || sending}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${emails.length > 0 ? emails.length : ""} Invitation${emails.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
