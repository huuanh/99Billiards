import type { ReactNode } from "react";

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

export interface ArticleContentPost {
  content?: string;
  contentFormat?: string;
  contentJson?: unknown;
}

function isTiptapNode(value: unknown): value is TiptapNode {
  return Boolean(value && typeof value === "object" && typeof (value as TiptapNode).type === "string");
}

function renderChildren(nodes: TiptapNode[] | undefined, keyPrefix: string): ReactNode {
  return nodes?.map((node, index) => renderNode(node, `${keyPrefix}-${index}`)) || null;
}

function applyMarks(content: ReactNode, marks: TiptapMark[] | undefined, key: string): ReactNode {
  return (marks || []).reduce((current, mark, index) => {
    if (mark.type === "bold") return <strong key={`${key}-mark-${index}`}>{current}</strong>;
    if (mark.type === "italic") return <em key={`${key}-mark-${index}`}>{current}</em>;
    if (mark.type === "underline") return <u key={`${key}-mark-${index}`}>{current}</u>;
    if (mark.type === "strike") return <s key={`${key}-mark-${index}`}>{current}</s>;
    if (mark.type === "code") {
      return (
        <code key={`${key}-mark-${index}`} className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-[#d6ff3f]">
          {current}
        </code>
      );
    }
    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
      return (
        <a
          key={`${key}-mark-${index}`}
          href={href}
          className="font-bold text-[#d6ff3f] underline decoration-[#d6ff3f]/50 underline-offset-4"
          rel="noreferrer"
          target={href.startsWith("http") ? "_blank" : undefined}
        >
          {current}
        </a>
      );
    }
    return current;
  }, content);
}

function renderNode(node: TiptapNode, key: string): ReactNode {
  if (node.type === "text") return applyMarks(node.text || "", node.marks, key);
  if (node.type === "hardBreak") return <br key={key} />;

  if (node.type === "paragraph") {
    return (
      <p key={key} className="my-5 text-lg leading-9 text-white/78">
        {renderChildren(node.content, key)}
      </p>
    );
  }

  if (node.type === "heading") {
    const level = node.attrs?.level === 3 ? 3 : 2;
    if (level === 3) {
      return (
        <h3 key={key} className="mb-3 mt-9 text-2xl font-black text-white">
          {renderChildren(node.content, key)}
        </h3>
      );
    }

    return (
      <h2 key={key} className="mb-4 mt-11 text-3xl font-black text-white md:text-4xl">
        {renderChildren(node.content, key)}
      </h2>
    );
  }

  if (node.type === "bulletList") {
    return (
      <ul key={key} className="my-6 list-disc space-y-2 pl-6 text-lg leading-8 text-white/78">
        {renderChildren(node.content, key)}
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol key={key} className="my-6 list-decimal space-y-2 pl-6 text-lg leading-8 text-white/78">
        {renderChildren(node.content, key)}
      </ol>
    );
  }

  if (node.type === "listItem") {
    return <li key={key}>{renderChildren(node.content, key)}</li>;
  }

  if (node.type === "blockquote") {
    return (
      <blockquote key={key} className="my-8 border-l-4 border-[#d6ff3f] bg-white/[0.06] px-5 py-4 text-xl font-bold leading-9 text-white">
        {renderChildren(node.content, key)}
      </blockquote>
    );
  }

  if (node.type === "horizontalRule") {
    return <hr key={key} className="my-10 border-white/12" />;
  }

  if (node.type === "image") {
    const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
    const caption =
      typeof node.attrs?.caption === "string"
        ? node.attrs.caption
        : typeof node.attrs?.title === "string"
          ? node.attrs.title
          : "";
    if (!src) return null;

    return (
      <figure key={key} className="my-9 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full object-cover" />
        {caption ? (
          <figcaption className="border-t border-white/10 px-4 py-3 text-sm font-bold text-white/55">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return <div key={key}>{renderChildren(node.content, key)}</div>;
}

function PlainArticleRenderer({ content }: { content?: string }) {
  return (
    <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 text-lg leading-8 text-white/78">
      <div className="whitespace-pre-line">{content}</div>
    </div>
  );
}

function RichArticleRenderer({ contentJson }: { contentJson: TiptapNode }) {
  return (
    <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
      {renderChildren(contentJson.content, "article")}
    </div>
  );
}

export function ArticleContent({ post }: { post: ArticleContentPost }) {
  if (post.contentFormat === "tiptap" && isTiptapNode(post.contentJson)) {
    return <RichArticleRenderer contentJson={post.contentJson} />;
  }

  return <PlainArticleRenderer content={post.content} />;
}
