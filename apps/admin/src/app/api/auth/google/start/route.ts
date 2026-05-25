import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function adminBaseUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
}

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google-config", adminBaseUrl()));
  }

  const state = crypto.randomUUID();
  (await cookies()).set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${adminBaseUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
