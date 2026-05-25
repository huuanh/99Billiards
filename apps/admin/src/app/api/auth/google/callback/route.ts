import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAdminSession, upsertGoogleAdminUser } from "@/lib/auth";

export const runtime = "nodejs";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function adminBaseUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = (await cookies()).get("google_oauth_state")?.value;
  (await cookies()).delete("google_oauth_state");

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=google", adminBaseUrl()));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google-config", adminBaseUrl()));
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${adminBaseUrl()}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const token = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok || !token.access_token) {
      throw new Error(token.error || "Google token exchange failed");
    }

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    const profile = (await profileResponse.json()) as GoogleProfile;
    if (!profileResponse.ok || !profile.email || profile.email_verified === false) {
      throw new Error("Google profile is not verified");
    }

    const session = await upsertGoogleAdminUser({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      googleId: profile.sub,
    });
    await setAdminSession(session);

    const nextPath = session.role === "pending" ? "/pending" : session.role === "operator" ? "/bookings" : "/";
    return NextResponse.redirect(new URL(nextPath, adminBaseUrl()));
  } catch (error) {
    console.error("Google login failed", error);
    return NextResponse.redirect(new URL("/login?error=google", adminBaseUrl()));
  }
}
