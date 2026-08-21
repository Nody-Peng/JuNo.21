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
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
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

  const AUTO_SAVE_KEY = 'juno_draft_post';

  // Load from local storage
  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTO_SAVE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.excerpt) setExcerpt(parsed.excerpt);
        if (parsed.series) setSeries(parsed.series);
        if (parsed.slug) setSlug(parsed.slug);
        if (parsed.blocks && parsed.blocks.length > 0) setBlocks(parsed.blocks);
        if (parsed.selectedCategories) setSelectedCategories(parsed.selectedCategories);
      } catch (e) {
        console.error('Failed to parse saved draft');
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    const data = { title, excerpt, series, slug, blocks, selectedCategories };
    const timeout = setTimeout(() => {
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, excerpt, series, slug, blocks, selectedCategories]);

  // Word count and reading time
  const wordCount = blocks.reduce((acc, block) => {
    if (block.type === 'image' || block.type === 'video' || block.type === 'divider') return acc;
    const text = block.content.replace(/<[^>]*>?/gm, '');
    return acc + text.length; 
  }, 0) + title.length + excerpt.length;
  
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

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
        slug: slug.trim() || undefined,
        heroImage: heroImageId || undefined,
        status: publish ? 'published' : 'draft',
      };

      const result = await createPost(token, postData);

      if (result?.id) {
        localStorage.removeItem(AUTO_SAVE_KEY);
        setPublished(true);
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
  }, [title, excerpt, blocks, coverFile, token, userId, selectedCategories, series, slug, router]);

  if (published) {
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
    <div className="min-h-screen bg-[#F9F8F6] relative">
      {/* ── Top Toolbar ── */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-[#3B2D2A]/5 px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => router.push('/my-posts')}
          className="flex items-center gap-2 text-[11px] font-semibold text-[#3B2D2A]/40 hover:text-[#3B2D2A] transition-colors tracking-widest uppercase"
        >
          <span className="text-lg leading-none mt-[-2px]">&larr;</span> Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-5 py-2.5 rounded-full text-[12px] font-semibold tracking-widest text-[#3B2D2A]/60 bg-white border border-[#3B2D2A]/10 hover:border-[#3B2D2A]/30 hover:text-[#3B2D2A] hover:shadow-sm transition-all duration-300 disabled:opacity-50 uppercase"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-6 py-2.5 rounded-full text-[12px] font-bold tracking-widest bg-[#3B2D2A] text-[#F9F8F6] hover:bg-[#2a1f1c] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 uppercase"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center py-2 px-8 bg-gray-50 border-b border-gray-100 text-[11px] text-gray-400 gap-4 tracking-widest uppercase">
        <span>{wordCount} Words</span>
        <span>•</span>
        <span>{readingTime} Min Read</span>
        {autoSaved && (
          <>
            <span>•</span>
            <span className="text-amber-600">Saved</span>
          </>
        )}
      </div>

      {/* ── Main Editor Area ── */}
      <div className="max-w-[720px] mx-auto px-8 md:px-6 py-16">
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
            <div className="flex flex-col items-center justify-center py-6 text-gray-400 group-hover:text-amber-600 transition-colors">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-60"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <span className="text-[13px] font-medium tracking-widest uppercase">Click or Drag to Upload Cover Image</span>
            </div>
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

        {/* ── Series & Slug ── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={series}
            onChange={e => setSeries(e.target.value)}
            placeholder="系列名稱（選填，如：抗癌日記）"
            className="flex-1 outline-none bg-transparent text-xs text-gray-500 placeholder-gray-400 border-none focus:ring-0 p-0"
          />
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="網址 Slug（選填，如：my-first-post）"
            className="flex-1 outline-none bg-transparent text-xs text-gray-500 placeholder-gray-400 border-none focus:ring-0 p-0 md:text-right"
          />
        </div>

        {/* ── Divider ── */}
        <hr className="border-gray-100 mb-10" />

        {/* ── Block Editor ── */}
        <div className="pl-8">
          <BlockEditor 
            onChange={setBlocks} 
            onUploadImage={async (file) => {
              try {
                const res = await uploadMedia(token, file, file.name);
                return res ? { id: res.id, url: res.url } : null;
              } catch (e) {
                console.error(e);
                alert('圖片上傳失敗');
                return null;
              }
            }}
          />
        </div>

        {/* ── Bottom padding ── */}
        <div className="h-40" />
      </div>
    </div>
  );
}
