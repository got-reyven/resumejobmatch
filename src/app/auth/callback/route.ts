import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
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
      }

      const destination =
        next === "/dashboard" ? "/dashboard" : "/register/plan";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  const fallback = next === "/dashboard" ? "/auth/login" : "/register";
  return NextResponse.redirect(`${origin}${fallback}?error=auth_failed`);
}
