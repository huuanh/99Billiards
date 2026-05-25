import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminUserModel, connectDb } from "@99billiards/db";

const cookieName = "admin_session";

export type AdminRole = "admin" | "manager" | "operator" | "pending";
export type AdminPermission =
  | "dashboard"
  | "branches"
  | "products"
  | "promotions"
  | "posts"
  | "bookings"
  | "media"
  | "settings"
  | "users";

export interface AdminSession {
  email: string;
  name?: string;
  picture?: string;
  role: AdminRole;
  status?: "active" | "disabled";
}

export const roleLabels: Record<AdminRole, string> = {
  admin: "Admin",
  manager: "Manager",
  operator: "Van hanh",
  pending: "Cho phan quyen",
};

export const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  admin: ["dashboard", "branches", "products", "promotions", "posts", "bookings", "media", "settings", "users"],
  manager: ["dashboard", "branches", "products", "promotions", "posts", "bookings", "media"],
  operator: ["bookings"],
  pending: [],
};

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
  return new SignJWT({
    email: session.email,
    name: session.name,
    picture: session.picture,
    role: session.role,
    status: session.status || "active",
  })
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
    const role = String(result.payload.role || "pending") as AdminRole;
    if (!email) return null;

    if (await connectDb()) {
      const user = await AdminUserModel.findOne({ email: email.toLowerCase() }).lean();
      if (user) {
        return {
          email,
          name: String(user.name || result.payload.name || ""),
          picture: String(user.picture || result.payload.picture || ""),
          role: String(user.role || "pending") as AdminRole,
          status: String(user.status || "active") as "active" | "disabled",
        };
      }
    }

    return {
      email,
      name: String(result.payload.name || ""),
      picture: String(result.payload.picture || ""),
      role: rolePermissions[role] ? role : "pending",
      status: String(result.payload.status || "active") as "active" | "disabled",
    };
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

  if (session.status === "disabled") {
    await clearAdminSession();
    redirect("/login?error=disabled");
  }

  return session;
}

export function hasPermission(session: AdminSession | null, permission: AdminPermission) {
  if (!session || session.status === "disabled") return false;
  return rolePermissions[session.role]?.includes(permission) || false;
}

export async function requirePermission(permission: AdminPermission) {
  const session = await requireAdmin();
  if (!hasPermission(session, permission)) {
    redirect(session.role === "pending" ? "/pending" : "/unauthorized");
  }

  return session;
}

export async function upsertGoogleAdminUser(profile: {
  email: string;
  name?: string;
  picture?: string;
  googleId?: string;
}) {
  if (!(await connectDb())) {
    throw new Error("MongoDB is required for Google login");
  }

  const email = profile.email.toLowerCase();
  const existingCount = await AdminUserModel.countDocuments();
  const role: AdminRole = existingCount === 0 ? "admin" : "pending";
  const user = await AdminUserModel.findOneAndUpdate(
    { email },
    {
      $set: {
        name: profile.name || email,
        picture: profile.picture || "",
        googleId: profile.googleId || "",
        provider: "google",
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        role,
        status: "active",
      },
    },
    { upsert: true, new: true },
  ).lean();

  return {
    email,
    name: String(user.name || profile.name || email),
    picture: String(user.picture || profile.picture || ""),
    role: String(user.role || role) as AdminRole,
    status: String(user.status || "active") as "active" | "disabled",
  };
}
