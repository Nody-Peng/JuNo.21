'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlockEditor from '@/components/writer/BlockEditor';
import { type Block, blocksToLexical, lexicalToBlocks } from '@/lib/blocks-to-lexical';
import { updatePost, uploadMedia, type Category } from '@/lib/api';

interface Props {
  token: string;
  userId: number;
  categories: Category[];
  post: Record<string, unknown>;
}

export default function EditClient({ token, userId, categories, post }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState((post.title as string) || '');
  const [excerpt, setExcerpt] = useState((post.excerpt as string) || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    ((post.category as { id: string }[]) || []).map(c => c.id),
  );
  const [series, setSeries] = useState((post.series as string) || '');
  const [blocks, setBlocks] = useState<Block[]>(() => lexicalToBlocks(post.content as { root?: { children?: unknown[] } }));
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    (post.heroImage as { url?: string })?.url || null,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { alert('請先輸入標題！'); return; }
    setSaving(true);
    try {
      let heroImageId = (post.heroImage as { id?: string })?.id || undefined;
      if (coverFile) {
        const media = await uploadMedia(token, coverFile, title);
        heroImageId = media?.id;
      }

      const content = blocksToLexical(blocks);
      const result = await updatePost(token, post.id as string, {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content,
        category: selectedCategories.length ? selectedCategories : undefined,
        series: series.trim() || undefined,
        heroImage: heroImageId,
        _status: publish ? 'published' : 'draft',
      });

      if (result?.id) {
        setSaved(true);
        setTimeout(() => router.push('/my-posts'), 800);
      } else {
        alert('儲存失敗，請稍後再試。');
      }
    } catch { alert('發生錯誤，請稍後再試。'); }
    finally { setSaving(false); }
  };

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-xl font-serif text-[#3B2D2A]">文章已更新！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-[#F9F8F6]/95 backdrop-blur border-b border-[#3B2D2A]/8 px-6 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/my-posts')} className="text-sm text-gray-400 hover:text-[#3B2D2A]">
          ← 返回
        </button>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#3B2D2A] bg-white border border-[#3B2D2A]/15 hover:bg-gray-50 disabled:opacity-50">
            儲存草稿
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#3B2D2A] text-[#F9F8F6] hover:bg-[#2a1f1c] disabled:opacity-50">
            {saving ? '更新中...' : '更新發布'}
          </button>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-8 md:px-6 py-12">
        {/* Cover */}
        <div onClick={() => coverInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={handleDrop}
          className={`mb-8 rounded-2xl overflow-hidden cursor-pointer transition-all ${coverPreview ? 'aspect-video' : 'border-2 border-dashed border-gray-200 hover:border-amber-300 py-10 flex flex-col items-center gap-2 text-gray-300'}`}>
          {coverPreview ? (
            <div className="relative group w-full h-full">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">更換封面</span>
              </div>
            </div>
          ) : (<><span className="text-3xl">🖼️</span><span className="text-sm">點擊或拖曳上傳封面圖片</span></>)}
        </div>
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedCategories.includes(cat.id) ? 'bg-[#3B2D2A] text-[#F9F8F6] border-[#3B2D2A]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#3B2D2A]/40'}`}>
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <textarea value={title} onChange={e => setTitle(e.target.value)} placeholder="文章標題..." rows={1}
          className="w-full resize-none overflow-hidden outline-none bg-transparent text-[2.5rem] md:text-[3rem] font-bold font-serif text-[#3B2D2A] placeholder-gray-200 border-none focus:ring-0 p-0 mb-2 leading-tight"
          onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }} />

        {/* Excerpt */}
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="簡短的摘要（選填）..." rows={2}
          className="w-full resize-none overflow-hidden outline-none bg-transparent text-base text-gray-400 italic placeholder-gray-200 border-none focus:ring-0 p-0 mb-1"
          onInput={e => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }} />

        <input type="text" value={series} onChange={e => setSeries(e.target.value)}
          placeholder="系列名稱（選填）"
          className="w-full outline-none bg-transparent text-xs text-gray-300 placeholder-gray-200 border-none focus:ring-0 p-0 mb-8" />

        <hr className="border-gray-100 mb-10" />

        <div className="pl-8">
          <BlockEditor initialBlocks={blocks} onChange={setBlocks} />
        </div>
        <div className="h-40" />
      </div>
    </div>
  );
}
