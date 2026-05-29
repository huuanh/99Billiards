"use client";

import { useState } from "react";

interface UploadPayload {
  publicUrl: string;
  error?: string;
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
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });
      const payload = (await response.json()) as UploadPayload;

      if (!response.ok) {
        throw new Error(payload.error || "Upload lên R2 chưa thành công.");
      }

      setPublicUrl(payload.publicUrl);
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
        className="focus-ring min-h-11 rounded-2xl bg-[#2EB958] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black disabled:opacity-60"
      >
        {isUploading ? "Đang upload..." : "Upload qua server"}
      </button>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {publicUrl ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-black">Upload xong. URL anh:</p>
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
