export function getEnv(name: string, fallback = "") {
  return process.env[name] || fallback;
}

export const siteConfig = {
  brand: "99 Billiards",
  hotline: "0923 699 999",
  bookingPhone: "0979 171 717",
  socials: {
    facebook: "https://www.facebook.com/99-Billiards-Club-100980665724138/",
    tiktok: "https://www.tiktok.com/@99_billiards_club",
  },
};

export const r2Config = {
  accountId: getEnv("R2_ACCOUNT_ID"),
  accessKeyId: getEnv("R2_ACCESS_KEY_ID"),
  secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY"),
  bucket: getEnv("R2_BUCKET"),
  publicBaseUrl: getEnv("R2_PUBLIC_BASE_URL"),
};
