import { MediaAssetModel, connectDb } from "@99billiards/db";
import { deleteObjectByPublicUrl } from "@99billiards/db/r2";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { url?: string };
    const url = String(body.url || "").trim();

    if (!url) {
      return NextResponse.json({ error: "Missing image URL." }, { status: 400 });
    }

    const deleted = await deleteObjectByPublicUrl(url);
    if (deleted && (await connectDb())) {
      await MediaAssetModel.deleteMany({ url });
    }

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    console.error("Delete upload failed", error);
    return NextResponse.json({ error: "Xoa anh R2 chua thanh cong." }, { status: 500 });
  }
}
