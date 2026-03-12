import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/utils/api-error-handler";
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors/app-error";
import { z } from "zod";

const inviteSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one email is required")
    .max(10, "Maximum 10 emails per invite"),
});

// POST /api/v1/organization/invite
// Sends Supabase invite emails and tracks invitations in organization_invitations.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    if (!org) {
      throw new AuthorizationError(
        "Only organization owners can invite members."
      );
    }

    const body = await request.json();
    const { emails } = inviteSchema.parse(body);

    const uniqueEmails = [
      ...new Set(emails.map((e) => e.toLowerCase().trim())),
    ];

    if (uniqueEmails.includes(user.email?.toLowerCase() ?? "")) {
      throw new ValidationError("You cannot invite yourself.");
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("organization_invitations")
      .select("email")
      .eq("organization_id", org.id)
      .in("status", ["pending", "accepted"])
      .in("email", uniqueEmails);

    const alreadyInvited = new Set((existing ?? []).map((e) => e.email));

    const results: {
      email: string;
      status: "sent" | "already_invited" | "error";
      message?: string;
    }[] = [];

    for (const email of uniqueEmails) {
      if (alreadyInvited.has(email)) {
        results.push({
          email,
          status: "already_invited",
          message: "Already invited",
        });
        continue;
      }

      try {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

        const { data: inviteData, error: inviteError } =
          await admin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${siteUrl}/auth/callback?next=/accept-invite`,
            data: {
              invited_to_org: org.id,
              invited_to_org_name: org.name,
              invited_by: user.id,
            },
          });

        console.log("[invite]", email, {
          userId: inviteData?.user?.id ?? null,
          error: inviteError?.message ?? null,
          redirectTo: `${siteUrl}/auth/callback?next=/accept-invite`,
        });

        if (inviteError) {
          results.push({
            email,
            status: "error",
            message: inviteError.message,
          });
          continue;
        }

        if (!inviteData?.user) {
          results.push({
            email,
            status: "error",
            message:
              "User was not created. Check Supabase SMTP and auth settings.",
          });
          continue;
        }

        await admin.from("organization_invitations").insert({
          organization_id: org.id,
          email,
          role: "member",
          invited_by: user.id,
          status: "pending",
        });

        results.push({ email, status: "sent" });
      } catch (err) {
        console.error("[invite] exception for", email, err);
        results.push({
          email,
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const sentCount = results.filter((r) => r.status === "sent").length;

    return NextResponse.json({
      data: { sent: sentCount, total: uniqueEmails.length, results },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
