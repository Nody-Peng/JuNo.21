import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerAuth, logoutAction } from '@/lib/auth';
import { getMyPosts } from '@/lib/api';

export const metadata = { title: '我的文章 · 夏至原點' };

export default async function MyPostsPage() {
  const auth = await getServerAuth();
  if (!auth) redirect('/studio');

  const data = await getMyPosts(auth.token, auth.user.id);
  const posts = data?.docs || [];

  const published = posts.filter(p => p._status === 'published');
  const drafts    = posts.filter(p => p._status !== 'published');

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-12 px-6">
      <div className="max-w-[800px] mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#3B2D2A]">我的文章</h1>
            <p className="text-sm text-gray-400 mt-1">{auth.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/write"
              className="px-5 py-2.5 rounded-xl bg-[#3B2D2A] text-[#F9F8F6] text-sm font-medium hover:bg-[#2a1f1c] transition-colors"
            >
              + 新增文章
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl border border-[#3B2D2A]/15 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                登出
              </button>
            </form>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-3xl font-bold font-serif text-[#3B2D2A]">{published.length}</div>
            <div className="text-sm text-gray-400 mt-0.5">已發布</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-3xl font-bold font-serif text-[#3B2D2A]">{drafts.length}</div>
            <div className="text-sm text-gray-400 mt-0.5">草稿</div>
          </div>
        </div>

        {/* ── Posts List ── */}
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <div className="text-5xl mb-4">✍️</div>
            <p className="text-lg">還沒有任何文章</p>
            <Link href="/write" className="mt-4 inline-block text-sm text-amber-500 hover:underline">
              開始寫第一篇文章 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Published */}
            {published.length > 0 && (
              <>
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">已發布</h2>
                {published.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </>
            )}

            {/* Drafts */}
            {drafts.length > 0 && (
              <>
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-6 mb-3">草稿</h2>
                {drafts.map(post => (
                  <PostCard key={post.id} post={post} isDraft />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Post Card ───────────────────────────────────────────────

interface PostItem {
  id: string;
  title: string;
  slug?: string;
  publishedDate: string;
  _status?: string;
  heroImage?: { url?: string };
}

function PostCard({ post, isDraft }: { post: PostItem; isDraft?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-[#3B2D2A]/20 transition-colors group">
      {post.heroImage?.url ? (
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
          <img src={post.heroImage.url} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-xl bg-gray-50 shrink-0 flex items-center justify-center text-gray-200 text-2xl">
          📝
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {isDraft && (
            <span className="text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
              草稿
            </span>
          )}
          <h3 className="font-medium text-[#3B2D2A] truncate text-sm">{post.title}</h3>
        </div>
        <p className="text-xs text-gray-400">
          {new Date(post.publishedDate).toLocaleDateString('zh-TW', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isDraft && (
          <Link
            href={`/post/${post.slug || post.id}`}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-[#3B2D2A] hover:bg-gray-50 transition-colors"
            target="_blank"
          >
            查看
          </Link>
        )}
        <Link
          href={`/my-posts/${post.id}/edit`}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#3B2D2A]/5 text-[#3B2D2A] hover:bg-[#3B2D2A]/10 transition-colors"
        >
          編輯
        </Link>
      </div>
    </div>
  );
}
