import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPostById } from "@99billiards/db";
import type { Post } from "@99billiards/db/seed";
import { AdminShell, StatusPill } from "@/components/admin-shell";
import { ArticlePreviewContent } from "@/components/article-preview-content";

interface AdminPost extends Post {
  _id?: string;
  status?: "published" | "draft";
  contentFormat?: "plain" | "tiptap";
  contentJson?: unknown;
  contentText?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPostPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const post = (await getAdminPostById(id)) as AdminPost | null;
  if (!post) notFound();

  return (
    <AdminShell title="Xem bài viết" subtitle="Preview bài viết trong CMS, bao gồm cả bản draft.">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/posts"
            className="inline-flex min-h-9 w-fit items-center rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm font-bold text-[#111713]"
          >
            ← Quay lại tin tức
          </Link>
          <StatusPill label={post.status || "published"} tone={post.status === "draft" ? "warning" : "good"} />
        </div>

        <article className="rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-5 shadow-sm md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#047857]">
            {post.category} · {post.publishedAt}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#111713] md:text-5xl">{post.title}</h1>

          {post.contentFormat !== "tiptap" && post.image ? (
            <div className="mt-8 overflow-hidden rounded-lg border border-[#dfe3d8] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt={post.title} className="aspect-video w-full object-cover" />
            </div>
          ) : null}

          <ArticlePreviewContent post={post} />
        </article>
      </div>
    </AdminShell>
  );
}
