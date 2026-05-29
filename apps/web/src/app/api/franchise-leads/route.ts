import { NextResponse } from "next/server";
import { FranchiseLeadModel, connectDb } from "@99billiards/db";
import { franchiseLeadSchema } from "@99billiards/db/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = franchiseLeadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const connection = await connectDb().catch((error) => {
    console.error("Franchise lead DB connection failed", error);
    return null;
  });
  if (!connection) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Franchise service is temporarily unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      preview: true,
      message: "Franchise lead accepted in preview mode. Configure MONGODB_URI to persist.",
    });
  }

  const lead = await FranchiseLeadModel.create(parsed.data);
  return NextResponse.json({ ok: true, id: lead._id.toString() });
}
