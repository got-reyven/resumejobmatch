import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination =
        next === "/dashboard" ? "/dashboard" : "/register/plan";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  const fallback = next === "/dashboard" ? "/auth/login" : "/register";
  return NextResponse.redirect(`${origin}${fallback}?error=auth_failed`);
}
