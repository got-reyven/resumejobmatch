import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const supabase = await createClient();
  let authenticated = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authenticated = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    authenticated = !error;
  }

  if (authenticated) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      const meta = user.user_metadata ?? {};

      await admin.from("profiles").upsert(
        {
          id: user.id,
          full_name: meta.full_name ?? meta.name ?? null,
          avatar_url: meta.avatar_url ?? null,
          user_type: "jobseeker",
        },
        { onConflict: "id", ignoreDuplicates: true }
      );

      if (meta.invited_to_org) {
        return NextResponse.redirect(`${origin}/accept-invite`);
      }
    }

    const destination = next === "/dashboard" ? "/dashboard" : "/register/plan";
    return NextResponse.redirect(`${origin}${destination}`);
  }

  const fallback = next === "/dashboard" ? "/auth/login" : "/register";
  return NextResponse.redirect(`${origin}${fallback}?error=auth_failed`);
}
