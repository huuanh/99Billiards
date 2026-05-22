import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { r2Config } from "@99billiards/config";

export function getR2Client() {
  if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Config.accessKeyId,
      secretAccessKey: r2Config.secretAccessKey,
    },
  });
}

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  const client = getR2Client();
  if (!client || !r2Config.bucket || !r2Config.publicBaseUrl) {
    throw new Error("R2 is not configured");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `${r2Config.publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

export function getR2KeyFromPublicUrl(url: string) {
  if (!r2Config.publicBaseUrl) return null;

  const baseUrl = r2Config.publicBaseUrl.replace(/\/$/, "");
  if (!url.startsWith(`${baseUrl}/`)) return null;

  return decodeURIComponent(url.slice(baseUrl.length + 1));
}

export async function deleteObjectByPublicUrl(url: string) {
  const key = getR2KeyFromPublicUrl(url);
  if (!key) return false;

  const client = getR2Client();
  if (!client || !r2Config.bucket) {
    throw new Error("R2 is not configured");
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
    }),
  );

  return true;
}
