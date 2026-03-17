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

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL ?? "Resume Job Match <onboarding@resend.dev>";

async function sendInviteEmail(
  to: string,
  inviteLink: string,
  orgName: string
): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject: `Resume Job Match: You have been invited to join ${orgName}!`,
      html: `
        <h2>You have been invited to Resume Job Match</h2>
        <p>You have been invited to join <strong>${orgName}</strong> on Resume Job Match.</p>
        <p>Click the link below to accept the invite and set up your account:</p>
        <p><a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#6696C9;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Accept Invite</a></p>
        <p style="margin-top:16px;color:#666;font-size:14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color:#666;font-size:12px;word-break:break-all;">${inviteLink}</p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return {
      success: false,
      error: body?.message ?? `Resend API error (${res.status})`,
    };
  }

  return { success: true };
}

// POST /api/v1/organization/invite
// Creates invite users via generateLink and sends emails via Resend API.
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

        const { data: linkData, error: linkError } =
          await admin.auth.admin.generateLink({
            type: "invite",
            email,
            options: {
              redirectTo: `${siteUrl}/auth/callback?next=/accept-invite`,
              data: {
                invited_to_org: org.id,
                invited_to_org_name: org.name,
                invited_by: user.id,
              },
            },
          });

        if (linkError) {
          console.error(
            "[invite] generateLink error:",
            email,
            linkError.message
          );
          results.push({ email, status: "error", message: linkError.message });
          continue;
        }

        const inviteLink =
          linkData?.properties?.action_link ??
          linkData?.properties?.hashed_token;

        if (!inviteLink) {
          console.error("[invite] no link generated for:", email);
          results.push({
            email,
            status: "error",
            message: "Failed to generate invite link",
          });
          continue;
        }

        const emailResult = await sendInviteEmail(email, inviteLink, org.name);

        if (!emailResult.success) {
          console.error(
            "[invite] email send failed:",
            email,
            emailResult.error
          );
          results.push({
            email,
            status: "error",
            message: emailResult.error ?? "Failed to send email",
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

        // eslint-disable-next-line no-console
        console.log("[invite] success:", email);
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
