import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";

// GET /api/v1/organization/invitations
// Returns pending invitations for the owner's organization.
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!org) {
      return NextResponse.json({ data: [] });
    }

    const { data, error } = await supabase
      .from("organization_invitations")
      .select("id, email, role, status, created_at, expires_at")
      .eq("organization_id", org.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data: (data ?? []).map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
