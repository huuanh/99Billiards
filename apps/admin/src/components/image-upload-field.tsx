"use client";

import { useRef, useState } from "react";

interface UploadPayload {
  publicUrl: string;
  error?: string;
}

function normalizeUrls(value?: string | string[]) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : value.split(",");
  return values.map((item) => item.trim()).filter(Boolean);
}

export function ImageUploadField({
  name,
  label,
  defaultValue,
  multiple = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | string[];
  multiple?: boolean;
}) {
  const [urls, setUrls] = useState(() => normalizeUrls(defaultValue));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadedInSessionRef = useRef(new Set<string>());

  async function deleteSessionUpload(url: string) {
    uploadedInSessionRef.current.delete(url);
    await fetch("/api/uploads/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  }

  async function uploadFiles(files: FileList | null) {
    const selectedFiles = Array.from(files || []).filter((file) => file.size > 0);
    if (!selectedFiles.length) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as UploadPayload;

        if (!response.ok) {
          throw new Error(payload.error || "Upload len R2 chua thanh cong.");
        }

        uploadedInSessionRef.current.add(payload.publicUrl);
        uploadedUrls.push(payload.publicUrl);
      }

      setUrls((current) => {
        if (multiple) return [...current, ...uploadedUrls];

        for (const url of current) {
          if (uploadedInSessionRef.current.has(url) && !uploadedUrls.includes(url)) {
            void deleteSessionUpload(url);
          }
        }

        return uploadedUrls.slice(-1);
      });
      if (inputRef.current) inputRef.current.value = "";
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload loi.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeUrl(url: string) {
    setUrls((current) => current.filter((item) => item !== url));
    if (uploadedInSessionRef.current.has(url)) {
      void deleteSessionUpload(url).catch(() => {
        setError("Khong xoa duoc anh vua upload. Anh se duoc don khi luu hoac xoa ban ghi.");
      });
    }
  }

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={urls.join(", ")} />
      <div className="flex flex-col gap-2 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-[#2b332d]">{label}</p>
            <p className="mt-1 text-xs text-[#657064]">
              {multiple
                ? "Upload nhieu anh, co the xoa tung anh khoi gallery."
                : "Upload anh qua server admin, form se tu luu URL R2."}
            </p>
          </div>
          <label className="focus-ring inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md bg-[#111713] px-3 py-2 text-sm font-bold text-white">
            {isUploading ? "Dang upload..." : multiple ? "Them anh" : "Chon anh"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              disabled={isUploading}
              onChange={(event) => uploadFiles(event.target.files)}
              className="sr-only"
            />
          </label>
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {urls.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {urls.map((url) => (
              <div key={url} className="overflow-hidden rounded-lg border border-[#dfe3d8] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-video w-full bg-[#eef1e9] object-cover" />
                <div className="grid gap-2 p-2">
                  <p className="truncate text-xs text-[#657064]">{url}</p>
                  <button
                    type="button"
                    onClick={() => removeUrl(url)}
                    className="min-h-8 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-black text-red-700"
                  >
                    Xoa anh khoi form
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[#cfd5c8] bg-white px-3 py-6 text-center text-sm text-[#657064]">
            Chua co anh.
          </div>
        )}
      </div>
    </div>
  );
}
