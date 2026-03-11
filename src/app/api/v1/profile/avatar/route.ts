import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError, ValidationError } from "@/lib/errors/app-error";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/v1/profile/avatar
// Uploads an avatar image and updates the user's profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ValidationError("No file provided", {
        file: ["An image file is required"],
      });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError("Invalid file type", {
        file: ["Only JPEG, PNG, and WebP images are accepted"],
      });
    }

    if (file.size > MAX_SIZE) {
      throw new ValidationError("File too large", {
        file: ["Avatar must be under 2MB"],
      });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ data: { avatarUrl } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
