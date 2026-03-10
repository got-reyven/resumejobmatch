import { createHash } from "crypto";
import type { NextRequest } from "next/server";

export function getIpHash(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}
