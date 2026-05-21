import { createUploadUrl } from "@99billiards/db/r2";
import { getAdminSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const filename = String(body?.filename || "asset").replace(/[^a-zA-Z0-9._-]/g, "-");
  const contentType = String(body?.contentType || "application/octet-stream");
  const key = `uploads/${Date.now()}-${filename}`;

  try {
    const result = await createUploadUrl(key, contentType);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "R2 upload is not configured. Add R2 env vars first.",
      },
      { status: 400 },
    );
  }
}
