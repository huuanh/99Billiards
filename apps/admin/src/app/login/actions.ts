"use server";

import { clearAdminSession, getAdminCredentials, setAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const credentials = getAdminCredentials();

  if (email !== credentials.email || password !== credentials.password) {
    redirect("/login?error=1");
  }

  await setAdminSession({ email, name: "Admin", role: "admin", status: "active" });
  redirect("/");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/login");
}
