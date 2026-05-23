"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

const maxFieldUploadBytes = 25 * 1024 * 1024;
const maxSingleUploadBytes = 10 * 1024 * 1024;

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function normalizeUrls(value?: string | string[]) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : value.split(",");
  return values.map((item) => item.trim()).filter(Boolean);
}

function makePendingImage(file: File): PendingImage {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
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
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const fileInputName = `${name}Files`;
  const retainedValue = useMemo(() => urls.join(", "), [urls]);

  useEffect(() => {
    return () => {
      for (const image of pendingImages) URL.revokeObjectURL(image.previewUrl);
    };
  }, [pendingImages]);

  useEffect(() => {
    function handleFormReset(event: Event) {
      const form = fieldRef.current?.closest("form");
      const formId = form?.getAttribute("data-admin-form-id");
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (!formId || detail?.formId !== formId) return;

      setPendingImages((current) => {
        for (const image of current) URL.revokeObjectURL(image.previewUrl);
        return [];
      });
      setUrls(normalizeUrls(defaultValue));
      setError("");
      if (inputRef.current) inputRef.current.value = "";
    }

    window.addEventListener("admin-form-reset", handleFormReset);
    return () => window.removeEventListener("admin-form-reset", handleFormReset);
  }, [defaultValue]);

  function syncInputFiles(nextImages: PendingImage[]) {
    if (!inputRef.current) return;

    const dataTransfer = new DataTransfer();
    for (const image of nextImages) dataTransfer.items.add(image.file);
    inputRef.current.files = dataTransfer.files;
  }

  function selectFiles(files: FileList | null) {
    const selectedFiles = Array.from(files || []).filter((file) => file.size > 0);
    if (!selectedFiles.length) return;

    setPendingImages((current) => {
      const oversizedFile = selectedFiles.find((file) => file.size > maxSingleUploadBytes);
      if (oversizedFile) {
        setError(
          `Anh "${oversizedFile.name}" nang ${formatMegabytes(oversizedFile.size)}. Moi anh toi da ${formatMegabytes(maxSingleUploadBytes)}.`,
        );
        syncInputFiles(current);
        return current;
      }

      const next = multiple
        ? [...current, ...selectedFiles.map(makePendingImage)]
        : [makePendingImage(selectedFiles[selectedFiles.length - 1])];
      const totalSize = next.reduce((total, image) => total + image.file.size, 0);

      if (totalSize > maxFieldUploadBytes) {
        setError(
          `Tong dung luong anh dang chon la ${formatMegabytes(totalSize)}. Moi lan luu toi da ${formatMegabytes(maxFieldUploadBytes)}.`,
        );
        syncInputFiles(current);
        return current;
      }

      for (const image of current) {
        if (!next.some((item) => item.id === image.id)) URL.revokeObjectURL(image.previewUrl);
      }

      setError("");
      syncInputFiles(next);
      return next;
    });
  }

  function removeExistingUrl(url: string) {
    setUrls((current) => current.filter((item) => item !== url));
  }

  function removePendingImage(id: string) {
    setPendingImages((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = current.filter((item) => item.id !== id);
      setError("");
      syncInputFiles(next);
      return next;
    });
  }

  return (
    <div ref={fieldRef} className="grid gap-2">
      <input type="hidden" name={name} value={retainedValue} />
      <div className="flex flex-col gap-2 rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-[#2b332d]">{label}</p>
            <p className="mt-1 text-xs text-[#657064]">
              {multiple
                ? "Chon nhieu anh, upload len R2 khi bam Luu."
                : "Chon anh moi, upload len R2 khi bam Luu."}
            </p>
          </div>
          <label className="focus-ring inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md bg-[#111713] px-3 py-2 text-sm font-bold text-white">
            {multiple ? "Them anh" : "Chon anh"}
            <input
              ref={inputRef}
              name={fileInputName}
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={(event) => selectFiles(event.target.files)}
              className="sr-only"
            />
          </label>
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {urls.length || pendingImages.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {urls.map((url) => (
              <div key={url} className="overflow-hidden rounded-lg border border-[#dfe3d8] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-video w-full bg-[#eef1e9] object-cover" />
                <div className="grid gap-2 p-2">
                  <p className="truncate text-xs text-[#657064]">{url}</p>
                  <button
                    type="button"
                    onClick={() => removeExistingUrl(url)}
                    className="min-h-8 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-black text-red-700"
                  >
                    Xoa anh khi luu
                  </button>
                </div>
              </div>
            ))}

            {pendingImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg border border-[#dfe3d8] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.previewUrl} alt="" className="aspect-video w-full bg-[#eef1e9] object-cover" />
                <div className="grid gap-2 p-2">
                  <p className="truncate text-xs font-bold text-[#2b332d]">{image.file.name}</p>
                  <p className="text-xs text-[#657064]">Se upload khi bam Luu.</p>
                  <button
                    type="button"
                    onClick={() => removePendingImage(image.id)}
                    className="min-h-8 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-black text-red-700"
                  >
                    Bo anh khoi form
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
