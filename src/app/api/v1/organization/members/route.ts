import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/utils/api-error-handler";
import {
  AuthenticationError,
  AuthorizationError,
} from "@/lib/errors/app-error";

// GET /api/v1/organization/members
// Returns all team members for the caller's organization, with profile data.
// Falls back to showing the owner if no org_members rows exist yet.
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "business") {
      throw new AuthorizationError(
        "Team is only available for business accounts."
      );
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!org) {
      return NextResponse.json({
        data: {
          organizationName: null,
          members: [
            {
              id: user.id,
              email: user.email,
              fullName: null,
              avatarUrl: null,
              role: "owner",
              status: "active",
              joinedAt: null,
            },
          ],
        },
      });
    }

    const admin = createAdminClient();

    const { data: members, error } = await admin
      .from("organization_members")
      .select("user_id, role, status, joined_at")
      .eq("organization_id", org.id)
      .order("role", { ascending: true })
      .order("joined_at", { ascending: true });

    if (error) throw error;

    if (!members || members.length === 0) {
      const { data: ownerProfile } = await admin
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      return NextResponse.json({
        data: {
          organizationName: org.name,
          members: [
            {
              id: user.id,
              email: user.email,
              fullName: ownerProfile?.full_name ?? null,
              avatarUrl: ownerProfile?.avatar_url ?? null,
              role: "owner",
              status: "active",
              joinedAt: null,
            },
          ],
        },
      });
    }

    const userIds = members.map((m) => m.user_id);

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const { data: authUsers } = await admin.auth.admin.listUsers();

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const emailMap = new Map(
      (authUsers?.users ?? []).map((u) => [u.id, u.email])
    );

    const result = members.map((m) => {
      const p = profileMap.get(m.user_id);
      return {
        id: m.user_id,
        email: emailMap.get(m.user_id) ?? null,
        fullName: p?.full_name ?? null,
        avatarUrl: p?.avatar_url ?? null,
        role: m.role,
        status: m.status,
        joinedAt: m.joined_at,
      };
    });

    return NextResponse.json({
      data: {
        organizationName: org.name,
        members: result,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
