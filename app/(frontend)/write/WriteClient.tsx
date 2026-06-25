'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlockEditor from '@/components/writer/BlockEditor';
import { type Block, blocksToLexical } from '@/lib/blocks-to-lexical';
import { createPost, uploadMedia, type Category } from '@/lib/api';

interface Props {
  token: string;
  userId: number;
  categories: Category[];
}

export default function WriteClient({ token, userId, categories }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [series, setSeries] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  };

  const handleSave = useCallback(async (publish: boolean) => {
    if (!title.trim()) {
      alert('請先輸入標題！');
      return;
    }
    setSaving(true);

    try {
      // Upload cover image if selected
      let heroImageId: string | null = null;
      if (coverFile) {
        const mediaResult = await uploadMedia(token, coverFile, title);
        heroImageId = mediaResult?.id || null;
      }

      // Convert blocks to Payload Lexical format
      const content = blocksToLexical(blocks);

      const postData = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content,
        author: userId,
        publishedDate: new Date().toISOString(),
        category: selectedCategories.length ? selectedCategories : undefined,
        series: series.trim() || undefined,
        heroImage: heroImageId || undefined,
        _status: publish ? 'published' : 'draft',
      };

      const result = await createPost(token, postData);

      if (result?.id) {
        setSaved(true);
        setTimeout(() => {
          router.push('/my-posts');
        }, 800);
      } else {
        alert('儲存失敗，請稍後再試。');
      }
    } catch (err) {
      console.error(err);
      alert('發生錯誤，請稍後再試。');
    } finally {
      setSaving(false);
    }
  }, [title, excerpt, blocks, coverFile, token, userId, selectedCategories, series, router]);

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-xl font-serif text-[#3B2D2A]">文章已儲存！</p>
          <p className="text-sm text-gray-400 mt-1">正在返回文章列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* ── Top Toolbar ── */}
      <div className="sticky top-0 z-40 bg-[#F9F8F6]/95 backdrop-blur border-b border-[#3B2D2A]/8 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/my-posts')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#3B2D2A] transition-colors"
        >
          ← 返回
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#3B2D2A] bg-white border border-[#3B2D2A]/15 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            儲存草稿
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#3B2D2A] text-[#F9F8F6] hover:bg-[#2a1f1c] transition-colors disabled:opacity-50"
          >
            {saving ? '發布中...' : '立即發布'}
          </button>
        </div>
      </div>

      {/* ── Main Editor Area ── */}
      <div className="max-w-[720px] mx-auto px-8 md:px-6 py-12">
        {/* ── Cover Image ── */}
        <div
          onClick={() => coverInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className={`mb-8 rounded-2xl overflow-hidden cursor-pointer transition-all ${
            coverPreview
              ? 'aspect-video'
              : 'border-2 border-dashed border-gray-200 hover:border-amber-300 py-10 flex flex-col items-center gap-2 text-gray-300 hover:text-amber-400'
          }`}
        >
          {coverPreview ? (
            <div className="relative group w-full h-full">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">更換封面</span>
              </div>
            </div>
          ) : (
            <>
              <span className="text-3xl">🖼️</span>
              <span className="text-sm">點擊或拖曳上傳封面圖片</span>
            </>
          )}
        </div>
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-[#3B2D2A] text-[#F9F8F6] border-[#3B2D2A]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#3B2D2A]/40'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {/* ── Title ── */}
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="文章標題..."
          rows={1}
          className="w-full resize-none overflow-hidden outline-none bg-transparent text-[2.5rem] md:text-[3rem] font-bold font-serif text-[#3B2D2A] placeholder-gray-200 border-none focus:ring-0 p-0 mb-2 leading-tight"
          style={{ height: 'auto' }}
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }}
        />

        {/* ── Excerpt ── */}
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="簡短的摘要（選填）..."
          rows={2}
          className="w-full resize-none overflow-hidden outline-none bg-transparent text-base text-gray-400 italic placeholder-gray-200 border-none focus:ring-0 p-0 mb-1 leading-relaxed"
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }}
        />

        {/* ── Series ── */}
        <input
          type="text"
          value={series}
          onChange={e => setSeries(e.target.value)}
          placeholder="系列名稱（選填，如：抗癌日記）"
          className="w-full outline-none bg-transparent text-xs text-gray-300 placeholder-gray-200 border-none focus:ring-0 p-0 mb-8"
        />

        {/* ── Divider ── */}
        <hr className="border-gray-100 mb-10" />

        {/* ── Block Editor ── */}
        <div className="pl-8">
          <BlockEditor onChange={setBlocks} />
        </div>

        {/* ── Bottom padding ── */}
        <div className="h-40" />
      </div>
    </div>
  );
}
