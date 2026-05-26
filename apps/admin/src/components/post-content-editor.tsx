"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useMemo, useRef, useState } from "react";

type ContentFormat = "plain" | "tiptap";

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

interface InlineImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface LinkDialogState {
  open: boolean;
  url: string;
  label: string;
  from: number;
  to: number;
  selectedText: string;
}

interface ImageDialogState {
  open: boolean;
  caption: string;
  file: File | null;
  previewUrl: string;
  error: string;
}

const InlineImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploadId: {
        default: null,
      },
      caption: {
        default: null,
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { caption, uploadId, ...imageAttributes } = HTMLAttributes;
    const safeCaption = typeof caption === "string" ? caption.trim() : "";
    const renderedImageAttributes = uploadId
      ? { ...imageAttributes, "data-upload-id": String(uploadId) }
      : imageAttributes;

    if (!safeCaption) return ["img", renderedImageAttributes];

    return [
      "figure",
      { "data-type": "inline-image" },
      ["img", renderedImageAttributes],
      ["figcaption", safeCaption],
    ];
  },
});

const richEditorStyles = `
  .rich-editor-content .ProseMirror > * + * {
    margin-top: 0.85rem;
  }

  .rich-editor-content .ProseMirror ul,
  .rich-editor-content .ProseMirror ol {
    padding-left: 1.6rem;
  }

  .rich-editor-content .ProseMirror ul {
    list-style-type: disc;
  }

  .rich-editor-content .ProseMirror ol {
    list-style-type: decimal;
  }

  .rich-editor-content .ProseMirror li {
    padding-left: 0.25rem;
  }

  .rich-editor-content .ProseMirror li > p {
    margin: 0.25rem 0;
  }

  .rich-editor-content .ProseMirror blockquote {
    border-left: 4px solid #d6ff3f;
    background: #f0f4ea;
    margin: 1rem 0;
    padding: 0.85rem 1rem;
    font-weight: 800;
  }

  .rich-editor-content .ProseMirror a {
    color: #047857;
    font-weight: 800;
    text-decoration-line: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
  }

  .rich-editor-content .ProseMirror hr {
    border: 0;
    border-top: 2px solid #cfd5c8;
    margin: 1.25rem 0;
  }

  .rich-editor-content .ProseMirror img {
    max-width: 100%;
    border-radius: 0.75rem;
    border: 1px solid #dfe3d8;
  }

  .rich-editor-content .ProseMirror figure[data-type="inline-image"] {
    overflow: hidden;
    border: 1px solid #dfe3d8;
    border-radius: 0.75rem;
    background: #f8faf5;
  }

  .rich-editor-content .ProseMirror figure[data-type="inline-image"] img {
    width: 100%;
    border: 0;
    border-radius: 0;
  }

  .rich-editor-content .ProseMirror figure[data-type="inline-image"] figcaption {
    border-top: 1px solid #dfe3d8;
    padding: 0.65rem 0.85rem;
    color: #657064;
    font-size: 0.875rem;
    font-weight: 800;
    line-height: 1.45;
  }
`;

function textToDoc(text: string): TiptapNode {
  const lines = text.split(/\r?\n/);
  const paragraphs = lines.length ? lines : [""];

  return {
    type: "doc",
    content: paragraphs.map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : undefined,
    })),
  };
}

function isTiptapDoc(value: unknown): value is TiptapNode {
  return Boolean(value && typeof value === "object" && (value as TiptapNode).type === "doc");
}

function stringifyJson(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function collectBlobUploadIds(node: TiptapNode | undefined): string[] {
  if (!node) return [];
  const current =
    node.type === "image" &&
    typeof node.attrs?.src === "string" &&
    node.attrs.src.startsWith("blob:") &&
    typeof node.attrs.uploadId === "string"
      ? [node.attrs.uploadId]
      : [];
  return [...current, ...(node.content || []).flatMap(collectBlobUploadIds)];
}

function normalizeHref(value: string) {
  const href = value.trim();
  if (!href) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(href) ? href : `https://${href}`;
}

function ToolbarButton({
  active = false,
  disabled = false,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={[
        "min-h-9 rounded-md border px-3 py-2 text-sm font-black",
        active
          ? "border-[#111713] bg-[#111713] text-white"
          : "border-[#cfd5c8] bg-white text-[#111713]",
        disabled ? "cursor-not-allowed opacity-45" : "hover:border-[#111713]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function PostContentEditor({
  defaultFormat,
  defaultContent,
  defaultContentJson,
}: {
  defaultFormat?: string;
  defaultContent?: string;
  defaultContentJson?: unknown;
}) {
  const initialFormat: ContentFormat = defaultFormat === "tiptap" ? "tiptap" : "plain";
  const initialDoc = useMemo(
    () => (isTiptapDoc(defaultContentJson) ? defaultContentJson : textToDoc(defaultContent || "")),
    [defaultContent, defaultContentJson],
  );
  const [format, setFormat] = useState<ContentFormat>(initialFormat);
  const [plainContent, setPlainContent] = useState(defaultContent || "");
  const [richJson, setRichJson] = useState<unknown>(initialDoc);
  const [richText, setRichText] = useState(defaultContent || "");
  const [inlineImages, setInlineImages] = useState<InlineImageFile[]>([]);
  const [linkDialog, setLinkDialog] = useState<LinkDialogState>({
    open: false,
    url: "",
    label: "",
    from: 0,
    to: 0,
    selectedText: "",
  });
  const [imageDialog, setImageDialog] = useState<ImageDialogState>({
    open: false,
    caption: "",
    file: null,
    previewUrl: "",
    error: "",
  });
  const inlineImagesRef = useRef<InlineImageFile[]>([]);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
        underline: false,
      }),
      InlineImage.configure({
        allowBase64: false,
        inline: false,
      }),
      Underline,
      Link.configure({
        autolink: true,
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
      }),
    ],
    content: initialDoc,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] rounded-b-lg bg-white px-5 py-4 text-base leading-8 outline-none",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      const json = updatedEditor.getJSON() as TiptapNode;
      setRichJson(json);
      setRichText(updatedEditor.getText({ blockSeparator: "\n" }));

      const activeUploadIds = new Set(collectBlobUploadIds(json));
      setInlineImages((current) => {
        const next = current.filter((image) => activeUploadIds.has(image.id));
        for (const image of current) {
          if (!activeUploadIds.has(image.id)) URL.revokeObjectURL(image.previewUrl);
        }
        syncInlineImageInput(next);
        return next;
      });
    },
  });

  useEffect(() => {
    inlineImagesRef.current = inlineImages;
  }, [inlineImages]);

  useEffect(() => {
    return () => {
      for (const image of inlineImagesRef.current) URL.revokeObjectURL(image.previewUrl);
    };
  }, []);

  function syncInlineImageInput(nextImages: InlineImageFile[]) {
    if (!inlineImageInputRef.current) return;
    const dataTransfer = new DataTransfer();
    for (const image of nextImages) dataTransfer.items.add(image.file);
    inlineImageInputRef.current.files = dataTransfer.files;
  }

  function changeFormat(nextFormat: ContentFormat) {
    setFormat(nextFormat);

    if (nextFormat === "tiptap" && editor) {
      const nextDoc = isTiptapDoc(richJson) ? richJson : textToDoc(plainContent);
      editor.commands.setContent(nextDoc);
      setRichJson(nextDoc);
      setRichText(editor.getText({ blockSeparator: "\n" }));
    }

    if (nextFormat === "plain") {
      setPlainContent(richText || plainContent);
    }
  }

  function openLinkDialog() {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const selectedText = empty ? "" : editor.state.doc.textBetween(from, to, " ");
    setLinkDialog({
      open: true,
      url: previousUrl || "",
      label: selectedText,
      from,
      to,
      selectedText,
    });
  }

  function closeLinkDialog() {
    setLinkDialog((current) => ({ ...current, open: false }));
  }

  function applyLink() {
    if (!editor) return;
    const normalizedHref = normalizeHref(linkDialog.url);
    const hasSelection = linkDialog.from !== linkDialog.to;

    if (!normalizedHref) {
      if (hasSelection) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: linkDialog.from, to: linkDialog.to })
          .extendMarkRange("link")
          .unsetLink()
          .run();
      }
      closeLinkDialog();
      return;
    }

    const label = linkDialog.label.trim() || linkDialog.selectedText || normalizedHref;
    if (!hasSelection || label !== linkDialog.selectedText) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: linkDialog.from, to: linkDialog.to })
        .insertContent({
          type: "text",
          text: label,
          marks: [{ type: "link", attrs: { href: normalizedHref } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: linkDialog.from, to: linkDialog.to })
        .extendMarkRange("link")
        .setLink({ href: normalizedHref })
        .run();
    }

    closeLinkDialog();
  }

  function removeLink() {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .setTextSelection({ from: linkDialog.from, to: linkDialog.to })
      .extendMarkRange("link")
      .unsetLink()
      .run();
    closeLinkDialog();
  }

  function openImageDialog() {
    setImageDialog({
      open: true,
      caption: "",
      file: null,
      previewUrl: "",
      error: "",
    });
  }

  function closeImageDialog() {
    setImageDialog((current) => {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return {
        open: false,
        caption: "",
        file: null,
        previewUrl: "",
        error: "",
      };
    });
  }

  function selectImageForDialog(files: FileList | null) {
    const file = Array.from(files || []).find((item) => item.size > 0) || null;
    setImageDialog((current) => {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      if (!file) {
        return { ...current, file: null, previewUrl: "", error: "" };
      }
      if (!file.type.startsWith("image/")) {
        return { ...current, file: null, previewUrl: "", error: "Vui lòng chọn file ảnh." };
      }
      return { ...current, file, previewUrl: URL.createObjectURL(file), error: "" };
    });
  }

  function addInlineImage() {
    if (!editor) return;
    const file = imageDialog.file;
    if (!file) return;

    const id = `inline-${crypto.randomUUID()}`;
    const previewUrl = URL.createObjectURL(file);
    const nextImage = { id, file, previewUrl };
    const caption = imageDialog.caption.trim();

    setInlineImages((current) => {
      const next = [...current, nextImage];
      syncInlineImageInput(next);
      return next;
    });

    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: previewUrl,
          alt: file.name,
          title: caption,
          caption,
          uploadId: id,
        },
      })
      .run();

    closeImageDialog();
  }

  return (
    <div className="grid gap-4">
      <style>{richEditorStyles}</style>
      <input type="hidden" name="contentFormat" value={format} />
      <input type="hidden" name="contentJson" value={format === "tiptap" ? stringifyJson(richJson) : ""} />
      <input type="hidden" name="contentText" value={format === "tiptap" ? richText : plainContent} />
      <input type="hidden" name="contentInlineImageIds" value={inlineImages.map((image) => image.id).join(",")} />
      <input
        ref={inlineImageInputRef}
        name="contentInlineImagesFiles"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
      />

      <div className="grid gap-2">
        <label className="text-sm font-bold text-[#2b332d]">Kiểu nội dung</label>
        <div className="inline-grid w-fit grid-cols-2 overflow-hidden rounded-md border border-[#cfd5c8] bg-white p-1">
          {[
            ["plain", "Plain text"],
            ["tiptap", "Rich editor"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeFormat(value as ContentFormat)}
              className={[
                "min-h-9 rounded px-4 py-2 text-sm font-black",
                format === value ? "bg-[#111713] text-white" : "text-[#657064] hover:text-[#111713]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {format === "plain" ? (
        <label className="grid gap-2 text-sm font-bold text-[#2b332d]">
          Nội dung
          <textarea
            name="content"
            value={plainContent}
            onChange={(event) => setPlainContent(event.target.value)}
            className="focus-ring min-h-[420px] resize-y rounded-lg border border-[#cfd5c8] bg-white px-4 py-3 text-sm leading-7 outline-none"
          />
        </label>
      ) : (
        <div className="grid gap-2">
          <input type="hidden" name="content" value={richText} />
          <div className="rich-editor-content rounded-lg border border-[#cfd5c8] bg-[#f8faf5]">
            <div className="flex flex-wrap gap-2 border-b border-[#dfe3d8] p-3">
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("heading", { level: 2 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                H2
              </ToolbarButton>
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("heading", { level: 3 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                H3
              </ToolbarButton>
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                B
              </ToolbarButton>
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                I
              </ToolbarButton>
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("underline")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                U
              </ToolbarButton>
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("bulletList")}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                List
              </ToolbarButton>
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("orderedList")}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              >
                1. List
              </ToolbarButton>
              <ToolbarButton
                disabled={!editor}
                active={editor?.isActive("blockquote")}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              >
                Quote
              </ToolbarButton>
              <ToolbarButton disabled={!editor} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
                Divider
              </ToolbarButton>
              <ToolbarButton disabled={!editor} active={editor?.isActive("link")} onClick={openLinkDialog}>
                Link
              </ToolbarButton>
              <ToolbarButton disabled={!editor} onClick={openImageDialog}>
                Image
              </ToolbarButton>
              <ToolbarButton disabled={!editor} onClick={() => editor?.chain().focus().undo().run()}>
                Undo
              </ToolbarButton>
              <ToolbarButton disabled={!editor} onClick={() => editor?.chain().focus().redo().run()}>
                Redo
              </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
          </div>
          <p className="text-xs text-[#657064]">
            Rich editor se luu JSON rieng va website render theo contentFormat=tiptap.
          </p>
        </div>
      )}

      {linkDialog.open ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-lg border border-[#dfe3d8] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-black">Them link</h4>
                <p className="mt-1 text-sm font-bold text-[#657064]">
                  Gắn URL vào đoạn text đang chọn hoặc chèn link mới.
                </p>
              </div>
              <button
                type="button"
                onClick={closeLinkDialog}
                className="min-h-9 rounded-md border border-[#cfd5c8] px-3 py-2 text-sm font-black"
              >
                Dong
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-bold text-[#2b332d]">
                URL
                <input
                  value={linkDialog.url}
                  onChange={(event) => setLinkDialog((current) => ({ ...current, url: event.target.value }))}
                  autoFocus
                  placeholder="https://99billiards.vn"
                  className="focus-ring min-h-11 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 outline-none"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#2b332d]">
                Text hiển thị
                <input
                  value={linkDialog.label}
                  onChange={(event) => setLinkDialog((current) => ({ ...current, label: event.target.value }))}
                  placeholder="Đặt bàn ngay"
                  className="focus-ring min-h-11 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 outline-none"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={removeLink}
                className="min-h-10 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700"
              >
                Xóa link
              </button>
              <div className="flex gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={closeLinkDialog}
                  className="min-h-10 rounded-md border border-[#cfd5c8] px-4 py-2 text-sm font-black"
                >
                  Huy
                </button>
                <button
                  type="button"
                  onClick={applyLink}
                  className="min-h-10 rounded-md bg-[#111713] px-4 py-2 text-sm font-black text-white"
                >
                  Them link
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {imageDialog.open ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4">
          <div className="w-full max-w-xl rounded-lg border border-[#dfe3d8] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-black">Thêm ảnh</h4>
                <p className="mt-1 text-sm font-bold text-[#657064]">
                  Ảnh chỉ được upload lên R2 sau khi bấm Lưu bài viết.
                </p>
              </div>
              <button
                type="button"
                onClick={closeImageDialog}
                className="min-h-9 rounded-md border border-[#cfd5c8] px-3 py-2 text-sm font-black"
              >
                Dong
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-bold text-[#2b332d]">
                File anh
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => selectImageForDialog(event.target.files)}
                  className="focus-ring min-h-11 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 outline-none"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-[#2b332d]">
                Caption
                <input
                  value={imageDialog.caption}
                  onChange={(event) => setImageDialog((current) => ({ ...current, caption: event.target.value }))}
                  placeholder="Không gian 99 Billiards"
                  className="focus-ring min-h-11 rounded-md border border-[#cfd5c8] bg-white px-3 py-2 outline-none"
                />
              </label>
              {imageDialog.error ? (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  {imageDialog.error}
                </p>
              ) : null}
              {imageDialog.previewUrl ? (
                <div className="overflow-hidden rounded-lg border border-[#dfe3d8] bg-[#f8faf5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageDialog.previewUrl} alt="" className="max-h-72 w-full object-contain" />
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeImageDialog}
                className="min-h-10 rounded-md border border-[#cfd5c8] px-4 py-2 text-sm font-black"
              >
                Huy
              </button>
              <button
                type="button"
                disabled={!imageDialog.file}
                onClick={addInlineImage}
                className="min-h-10 rounded-md bg-[#111713] px-4 py-2 text-sm font-black text-white disabled:opacity-45"
              >
                Chen anh
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
