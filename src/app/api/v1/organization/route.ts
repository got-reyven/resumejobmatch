import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  companySize: z.string().optional(),
  industry: z.array(z.string()).max(3).optional(),
});

// GET /api/v1/organization
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, company_size, industry")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      data: data
        ? {
            id: data.id,
            name: data.name,
            companySize: data.company_size,
            industry: data.industry ?? [],
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/v1/organization
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const body = await request.json();
    const updates = updateOrgSchema.parse(body);

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.companySize !== undefined)
      dbUpdates.company_size = updates.companySize;
    if (updates.industry !== undefined) dbUpdates.industry = updates.industry;

    const { data, error } = await supabase
      .from("organizations")
      .update(dbUpdates)
      .eq("owner_id", user.id)
      .select("id, name, company_size, industry")
      .single();

    if (error) throw error;

    return NextResponse.json({
      data: {
        id: data.id,
        name: data.name,
        companySize: data.company_size,
        industry: data.industry ?? [],
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
