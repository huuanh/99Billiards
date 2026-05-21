import { getPosts } from "@99billiards/db";
import type { Post } from "@99billiards/db/seed";
import { createPost, deletePost, updatePost } from "../actions";
import { AdminShell, Input, Panel, SaveButton, Select, Textarea } from "@/components/admin-shell";

interface AdminPost extends Post {
  _id?: string;
  status?: string;
}

export default async function PostsPage() {
  const posts = (await getPosts()) as AdminPost[];

  return (
    <AdminShell title="Tin tức" subtitle="Quản lý bài viết, recap giải đấu và thông báo.">
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Panel title="Bảng tin tức" subtitle={`${posts.length} bài viết đang hiển thị.`}>
          <div className="overflow-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-black/45">
                <tr>
                  <th>Tiêu đề</th>
                  <th>Chuyên mục</th>
                  <th>Ngày đăng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="bg-[#f4f6ef]">
                    <td className="rounded-l-2xl p-3 font-bold">{post.title}</td>
                    <td className="p-3">{post.category}</td>
                    <td className="p-3">{post.publishedAt}</td>
                    <td className="p-3">{post.status || "published"}</td>
                    <td className="rounded-r-2xl p-3">
                      {post._id ? (
                        <div className="flex gap-2">
                          <details className="relative">
                            <summary className="cursor-pointer rounded-xl bg-white px-3 py-2 font-bold">
                              Sửa
                            </summary>
                            <form
                              action={updatePost}
                              className="absolute right-0 z-10 mt-2 grid w-96 gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-2xl"
                            >
                              <input type="hidden" name="_id" value={post._id} />
                              <Input name="title" label="Tiêu đề" defaultValue={post.title} />
                              <Input name="category" label="Chuyên mục" defaultValue={post.category} />
                              <Input name="publishedAt" label="Ngày đăng" defaultValue={post.publishedAt} />
                              <Input name="image" label="Ảnh" defaultValue={post.image} />
                              <Textarea name="excerpt" label="Tóm tắt" defaultValue={post.excerpt} />
                              <Textarea name="content" label="Nội dung" defaultValue={post.content} />
                              <Input name="seoTitle" label="SEO title" defaultValue={post.seoTitle} />
                              <Textarea name="seoDescription" label="SEO description" defaultValue={post.seoDescription} />
                              <Select name="status" label="Trạng thái" options={["published", "draft"]} defaultValue={post.status || "published"} />
                              <SaveButton label="Cập nhật" />
                            </form>
                          </details>
                          <form action={deletePost}>
                            <input type="hidden" name="_id" value={post._id} />
                            <button className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-700">
                              Xóa
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-black/45">Seed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Thêm tin tức" subtitle="Nội dung dài có thể nâng cấp rich text editor sau.">
          <form action={createPost} className="grid gap-4">
            <Input name="title" label="Tiêu đề" placeholder="Lịch livestream cuối tuần" />
            <Input name="category" label="Chuyên mục" placeholder="Livestream" />
            <Input name="publishedAt" label="Ngày đăng" placeholder="2026-05-21" />
            <Input name="image" label="Ảnh URL / R2 URL" placeholder="https://..." />
              <Textarea name="excerpt" label="Tóm tắt" />
              <Textarea name="content" label="Nội dung" />
              <Input name="seoTitle" label="SEO title" placeholder="Tin tức 99 Billiards..." />
              <Textarea name="seoDescription" label="SEO description" />
            <SaveButton />
          </form>
        </Panel>
      </div>
    </AdminShell>
  );
}
