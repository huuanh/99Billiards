import { NextResponse } from "next/server";
import { BookingModel, connectDb } from "@99billiards/db";
import { bookingSchema } from "@99billiards/db/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const connection = await connectDb().catch((error) => {
    console.error("Booking DB connection failed", error);
    return null;
  });
  if (!connection) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Booking service is temporarily unavailable" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      preview: true,
      message: "Booking accepted in preview mode. Configure MONGODB_URI to persist.",
    });
  }

  const booking = await BookingModel.create(parsed.data);
  return NextResponse.json({ ok: true, id: booking._id.toString() });
}
