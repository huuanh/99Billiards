import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const cookieName = "admin_session";

export interface AdminSession {
  email: string;
}

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_JWT_SECRET is required in production");
  }

  return new TextEncoder().encode(secret || "dev-admin-secret");
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@99billiards.local",
    password: process.env.ADMIN_PASSWORD || "99billiards",
  };
}

export async function createAdminToken(session: AdminSession) {
  return new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const result = await jwtVerify(token, getSecret());
    const email = String(result.payload.email || "");
    return email ? { email } : null;
  } catch {
    return null;
  }
}

export async function setAdminSession(session: AdminSession) {
  const token = await createAdminToken(session);
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}
