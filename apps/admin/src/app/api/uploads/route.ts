import { MediaAssetModel, connectDb } from "@99billiards/db";
import { uploadObject } from "@99billiards/db/r2";
import { NextResponse } from "next/server";
import { hasPermission, getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const maxFileSize = 10 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  const cleaned = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "image";
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!hasPermission(session, "media")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Vui lòng chọn file ảnh." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Chi ho tro upload file anh." }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "Ảnh tối đa 10MB." }, { status: 400 });
    }

    const filename = sanitizeFilename(file.name);
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadObject(key, buffer, file.type || "application/octet-stream");

    if (await connectDb()) {
      await MediaAssetModel.create({
        filename: file.name,
        url: publicUrl,
        contentType: file.type,
        size: file.size,
        source: "r2",
      });
    }

    return NextResponse.json({ ok: true, publicUrl });
  } catch (error) {
    console.error("Upload failed", error);
    return NextResponse.json({ error: "Upload lên R2 chưa thành công." }, { status: 500 });
  }
}
