import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const values = new Map<string, string>();

for (const line of env.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const index = trimmed.indexOf("=");
  if (index === -1) continue;
  values.set(trimmed.slice(0, index), trimmed.slice(index + 1).replace(/^["']|["']$/g, ""));
}

const required = [
  "MONGODB_URI",
  "ADMIN_JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_BASE_URL",
];

let hasMissing = false;

for (const key of required) {
  const value = values.get(key) || process.env[key] || "";
  const isSet = value.trim().length > 0;
  if (!isSet) hasMissing = true;
  console.log(`${isSet ? "OK" : "MISSING"} ${key}`);
}

const mongoUri = values.get("MONGODB_URI") || process.env.MONGODB_URI || "";
if (mongoUri.includes("cluster.mongodb.net")) {
  console.log("WARN MONGODB_URI still looks like a placeholder Atlas host.");
}

if (hasMissing) {
  process.exitCode = 1;
}
