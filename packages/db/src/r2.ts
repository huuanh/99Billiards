import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export async function createUploadUrl(key: string, contentType: string) {
  const client = getR2Client();
  if (!client || !r2Config.bucket || !r2Config.publicBaseUrl) {
    throw new Error("R2 is not configured");
  }

  const command = new PutObjectCommand({
    Bucket: r2Config.bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
  return {
    uploadUrl,
    publicUrl: `${r2Config.publicBaseUrl.replace(/\/$/, "")}/${key}`,
  };
}
