import { getAdminSession } from "@/lib/auth";
import { MediaAssetModel, connectDb } from "@99billiards/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await connectDb())) {
    return NextResponse.json({ error: "MongoDB is not configured" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const url = String(body?.url || "").trim();
  if (!url) {
    return NextResponse.json({ error: "Missing media URL" }, { status: 400 });
  }

  const asset = await MediaAssetModel.create({
    filename: String(body?.filename || "asset"),
    url,
    contentType: String(body?.contentType || ""),
    size: Number(body?.size || 0),
  });

  return NextResponse.json({ ok: true, id: asset._id.toString() });
}
