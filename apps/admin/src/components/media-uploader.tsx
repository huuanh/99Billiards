"use client";

import { useState } from "react";

interface UploadResult {
  uploadUrl: string;
  publicUrl: string;
}

export function MediaUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [error, setError] = useState("");

  async function upload(formData: FormData) {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Vui lòng chọn một file ảnh.");
      return;
    }

    setIsUploading(true);
    setError("");
    setPublicUrl("");

    try {
      const signedResponse = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      const signedPayload = await signedResponse.json();
      if (!signedResponse.ok) {
        throw new Error(signedPayload.error || "Không tạo được upload URL.");
      }

      const uploadData = signedPayload as UploadResult;
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload lên R2 chưa thành công.");
      }

      await fetch("/api/media-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          url: uploadData.publicUrl,
          contentType: file.type,
          size: file.size,
        }),
      });

      setPublicUrl(uploadData.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload lỗi.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form action={upload} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold">
        Chọn ảnh
        <input
          name="file"
          type="file"
          accept="image/*"
          className="focus-ring rounded-2xl border border-black/10 bg-[#f4f6ef] px-4 py-3"
        />
      </label>
      <button
        disabled={isUploading}
        className="focus-ring min-h-11 rounded-2xl bg-[#d6ff3f] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black disabled:opacity-60"
      >
        {isUploading ? "Đang upload..." : "Upload lên R2"}
      </button>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {publicUrl ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-black">Upload xong. Dùng URL này cho trường ảnh:</p>
          <input
            readOnly
            value={publicUrl}
            className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2"
          />
        </div>
      ) : null}
    </form>
  );
}
