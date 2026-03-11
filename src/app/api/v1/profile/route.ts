import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";
import { updateProfileSchema } from "@/lib/validations/profile";

// GET /api/v1/profile
// Returns the authenticated user's profile, auto-creating if missing
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    const resolved = profile ?? (await ensureProfile(user));

    return NextResponse.json({
      data: {
        id: resolved.id,
        email: user.email,
        fullName: resolved.full_name,
        avatarUrl: resolved.avatar_url,
        userType: resolved.user_type ?? "jobseeker",
        tier: resolved.tier,
        phone: resolved.phone ?? null,
        location: resolved.location ?? null,
        createdAt: resolved.created_at,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function ensureProfile(user: {
  id: string;
  user_metadata?: Record<string, string>;
}) {
  const admin = createAdminClient();
  const meta = user.user_metadata ?? {};

  const { data, error } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: meta.full_name ?? meta.name ?? null,
        avatar_url: meta.avatar_url ?? null,
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

// PATCH /api/v1/profile
// Updates the authenticated user's profile name
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const body = await request.json();
    const { fullName } = updateProfileSchema.parse(body);

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)
      .select("id, full_name, avatar_url, user_type, tier")
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: {
        id: profile.id,
        email: user.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        userType: profile.user_type,
        tier: profile.tier,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
