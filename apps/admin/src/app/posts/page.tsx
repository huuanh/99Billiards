import Link from "next/link";
import { getAdminPosts, getPostCategories } from "@99billiards/db";
import type { Post, PostCategory } from "@99billiards/db/seed";
import { createPost, deletePost, updatePost } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, StatusPill, Textarea } from "@/components/admin-shell";
import { AdminActionForm } from "@/components/admin-action-form";
import { FormModal } from "@/components/admin-modal";
import { ImageUploadField } from "@/components/image-upload-field";
import { PostContentEditor } from "@/components/post-content-editor";

interface AdminPost extends Post {
  _id?: string;
  status?: "published" | "draft";
  contentFormat?: "plain" | "tiptap";
  contentJson?: unknown;
  contentText?: string;
}

interface AdminPostCategory extends PostCategory {
  _id?: string;
}

function PostForm({ post, categories }: { post?: AdminPost; categories: AdminPostCategory[] }) {
  const isEditing = Boolean(post?._id);
  const categoryOptions = categories.map((category) => category.name);

  return (
    <AdminActionForm action={isEditing ? updatePost : createPost} closeModalOnSuccess>
      {post?._id ? <input type="hidden" name="_id" value={post._id} /> : null}

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Thông tin bài viết</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="title" label="Tiêu đề" placeholder="Lịch livestream cuối tuần" defaultValue={post?.title} />
          {categoryOptions.length ? (
            <Select
              name="category"
              label="Chuyên mục"
              options={categoryOptions}
              defaultValue={post?.category || categoryOptions[0]}
            />
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
              Chưa có chuyên mục. Hãy tạo chuyên mục trước khi viết bài.
            </div>
          )}
          <Input name="publishedAt" label="Ngày đăng" placeholder="2026-05-21" defaultValue={post?.publishedAt} />
          <Select
            name="status"
            label="Trạng thái"
            options={["draft", "published"]}
            defaultValue={post?.status || "draft"}
          />
          <div className="md:col-span-2">
            <Textarea name="excerpt" label="Tóm tắt" defaultValue={post?.excerpt} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Nội dung bài viết</h3>
        <div className="mt-4">
          <PostContentEditor
            defaultFormat={post?.contentFormat || "plain"}
            defaultContent={post?.content}
            defaultContentJson={post?.contentJson}
          />
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">Ảnh bài viết</h3>
        <div className="mt-4">
          <ImageUploadField name="image" label="Ảnh đại diện" defaultValue={post?.image} />
        </div>
      </section>

      <section className="rounded-lg border border-[#dfe3d8] bg-white p-4">
        <h3 className="text-base font-black">SEO</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input name="seoTitle" label="SEO title" placeholder="Tin tức 99 Billiards..." defaultValue={post?.seoTitle} />
          <Textarea name="seoDescription" label="SEO description" defaultValue={post?.seoDescription} />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-[#dfe3d8] bg-[#f6f7f3]/95 py-4 backdrop-blur">
        <SaveButton label={isEditing ? "Cập nhật bài viết" : "Tạo bài viết"} />
      </div>
    </AdminActionForm>
  );
}

export default async function PostsPage() {
  const [posts, categories] = await Promise.all([
    getAdminPosts() as Promise<AdminPost[]>,
    getPostCategories() as Promise<AdminPostCategory[]>,
  ]);

  return (
    <AdminShell
      title="Tin tức"
      subtitle="Quản lý bài viết, recap giải đấu và thông báo."
    >
      <Panel
        title="Bảng tin tức"
        subtitle={`${posts.length} bài viết đang hiển thị.`}
        aside={
          <FormModal trigger="Thêm bài viết" title="Thêm bài viết" subtitle="Tạo bài viết mới kèm ảnh đại diện." intent="primary">
            <PostForm categories={categories} />
          </FormModal>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#e7eadf] text-[11px] uppercase tracking-[0.14em] text-[#657064]">
              <tr>
                <th className="px-3 py-2">Ảnh</th>
                <th className="px-3 py-2">Tiêu đề</th>
                <th className="px-3 py-2">Chuyên mục</th>
                <th className="px-3 py-2">Ngày đăng</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1e9]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#fbfcf8]">
                  <td className="px-3 py-3">
                    {post.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.image} alt="" className="h-10 w-14 rounded-md object-cover" />
                    ) : (
                      <span className="text-xs text-[#657064]">Chưa có</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-bold">{post.title}</td>
                  <td className="px-3 py-3">{post.category}</td>
                  <td className="px-3 py-3">{post.publishedAt}</td>
                  <td className="px-3 py-3">
                    <StatusPill label={post.status || "published"} tone={post.status === "draft" ? "warning" : "good"} />
                  </td>
                  <td className="px-3 py-3">
                    {post._id ? (
                      <div className="flex gap-2">
                        <FormModal trigger="Sửa" title={`Sửa ${post.title}`} subtitle="Cập nhật bài viết và ảnh đại diện.">
                          <PostForm post={post} categories={categories} />
                        </FormModal>
                        <Link
                          href={`/posts/${post._id || post.id}`}
                          className="inline-flex min-h-9 items-center rounded-md border border-[#cfd5c8] bg-white px-3 py-2 text-sm font-bold text-[#111713]"
                        >
                          Xem
                        </Link>
                        <form action={deletePost}>
                          <input type="hidden" name="_id" value={post._id} />
                          <button className="min-h-9 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                            Xóa
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-[#657064]">Seed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
