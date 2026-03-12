import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError, ValidationError } from "@/lib/errors/app-error";
import { z } from "zod";

const acceptSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
});

// POST /api/v1/organization/accept-invite
// Completes the invite flow: sets profile, creates org membership, marks invitation accepted.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const body = await request.json();
    const { fullName } = acceptSchema.parse(body);

    const meta = user.user_metadata ?? {};
    const orgId = meta.invited_to_org;

    if (!orgId) {
      throw new ValidationError(
        "No pending invitation found for this account."
      );
    }

    const admin = createAdminClient();

    await admin
      .from("profiles")
      .update({ full_name: fullName, user_type: "business" })
      .eq("id", user.id);

    const { data: existingMember } = await admin
      .from("organization_members")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingMember) {
      await admin.from("organization_members").insert({
        organization_id: orgId,
        user_id: user.id,
        role: "member",
        invited_by: meta.invited_by ?? null,
        joined_at: new Date().toISOString(),
        status: "active",
      });
    }

    await admin
      .from("organization_invitations")
      .update({ status: "accepted" })
      .eq("organization_id", orgId)
      .eq("email", user.email)
      .eq("status", "pending");

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
