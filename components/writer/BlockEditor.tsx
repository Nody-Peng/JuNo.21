'use client';
import {
  useState, useRef, useCallback, useEffect, KeyboardEvent,
} from 'react';
import type { Block, BlockType } from '@/lib/blocks-to-lexical';
import { uid } from '@/lib/blocks-to-lexical';
import SlashMenu from './SlashMenu';
import TipTapBlock from './TipTapBlock';

// ─── Types ───────────────────────────────────────────────────

interface Props {
  initialBlocks?: Block[];
  onChange: (blocks: Block[]) => void;
  onUploadImage?: (file: File) => Promise<{ id: string, url: string } | null>;
}

// ─── Block style config ──────────────────────────────────────

const BLOCK_STYLE: Record<BlockType, string> = {
  paragraph:    'text-[17px] text-gray-800 leading-relaxed',
  heading1:     'text-4xl font-bold text-gray-900 font-serif leading-tight',
  heading2:     'text-3xl font-semibold text-gray-900 font-serif leading-tight',
  heading3:     'text-2xl font-semibold text-gray-800 font-serif leading-snug',
  quote:        'text-[17px] italic text-gray-500 border-l-[3px] border-amber-400 pl-4',
  code:         'text-[14px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 whitespace-pre-wrap',
  divider:      '',
  bulletList:   'text-[17px] text-gray-800 leading-relaxed',
  numberedList: 'text-[17px] text-gray-800 leading-relaxed',
  map:          'text-[14px] font-mono bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700',
  video:        'text-[15px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700',
  product:      'text-[15px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700',
  table:        '', // Handled by custom UI
  image:        '', // Handled by custom UI
  button:       '', // Handled by custom UI
  toc:          'text-[15px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700',
  callout:      '', // Handled by custom UI
  toggle:       '', // Handled by custom UI
};

const BLOCK_PLACEHOLDER: Record<BlockType, string> = {
  paragraph:    "按 Enter 開始書寫，輸入 / 選擇格式...",
  heading1:     '大標題',
  heading2:     '中標題',
  heading3:     '小標題',
  quote:        '引用文字...',
  code:         '程式碼...',
  divider:      '',
  bulletList:   '列表項目',
  numberedList: '列表項目',
  map:          '貼上 Google Maps Embed HTML...',
  video:        '貼上 YouTube 或 Vimeo 網址...',
  product:      '', // Handled by custom UI
  table:        '', // Handled by custom UI
  image:        '', // Handled by custom UI
  button:       '', // Handled by custom UI
  toc:          '', // Handled by custom UI
  callout:      '', // Handled by custom UI
  toggle:       '', // Handled by custom UI
};

// ─── Markdown shortcut detection ─────────────────────────────

function detectMarkdown(text: string): BlockType | null {
  if (text === '# ')     return 'heading1';
  if (text === '## ')    return 'heading2';
  if (text === '### ')   return 'heading3';
  if (text === '| ')     return 'quote';
  if (text === '> ')     return 'toggle';
  if (text === '! ')     return 'callout';
  if (text === '```')    return 'code';
  if (text === '--- ')   return 'divider';
  if (text === '- ')     return 'bulletList';
  if (text === '* ')     return 'bulletList';
  if (text === '1. ')    return 'numberedList';
  return null;
}

// ─── Main Component ──────────────────────────────────────────

export default function BlockEditor({ initialBlocks, onChange, onUploadImage }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks?.length ? initialBlocks : [{ id: uid(), type: 'paragraph', content: '' }],
  );
  const [slashMenu, setSlashMenu] = useState<{
    blockId: string;
    query: string;
    position: { top: number; left: number };
  } | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  // Notify parent whenever blocks change
  useEffect(() => {
    onChange(blocks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Fix text truncation on mount (auto-resize all textareas)
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRefs.current.forEach(el => {
        if (el && !el.className.includes('w-0')) {
          el.style.height = 'auto';
          el.style.height = el.scrollHeight + 'px';
        }
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [blocks]);

  // Auto-resize textarea
  const autoResize = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  const focusBlock = useCallback((id: string, atEnd = true) => {
    setFocusId(id);
    setTimeout(() => {
      const el = textareaRefs.current.get(id);
      if (!el) return;
      el.focus();
      if (atEnd) {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else {
        el.selectionStart = el.selectionEnd = 0;
      }
    }, 10);
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const insertBlockAfter = useCallback((afterId: string, type: BlockType = 'paragraph') => {
    const newBlock: Block = { id: uid(), type, content: '' };
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    focusBlock(newBlock.id);
    return newBlock.id;
  }, [focusBlock]);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => {
      if (prev.length === 1) return [{ id: uid(), type: 'paragraph', content: '' }];
      const idx = prev.findIndex(b => b.id === id);
      const next = prev.filter(b => b.id !== id);
      const focusIdx = Math.max(0, idx - 1);
      setTimeout(() => focusBlock(next[focusIdx].id), 10);
      return next;
    });
  }, [focusBlock]);

  const insertBlockAbove = useCallback((beforeId: string, type: BlockType = 'paragraph') => {
    const newBlock: Block = { id: uid(), type, content: '' };
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === beforeId);
      const next = [...prev];
      next.splice(idx, 0, newBlock);
      return next;
    });
    focusBlock(newBlock.id);
    return newBlock.id;
  }, [focusBlock]);

  const moveBlockUp = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveBlockDown = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  // ── Key handlers ──────────────────────────────────────────

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>, block: Block) => {
    const el = e.currentTarget;

    // Close slash menu on Escape
    if (e.key === 'Escape') {
      setSlashMenu(null);
      return;
    }

    // Navigate slash menu with arrows (handled in menu component)
    if (slashMenu && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      return;
    }

    // Select slash item on Enter when menu open
    if (slashMenu && e.key === 'Enter') {
      e.preventDefault();
      return; // SlashMenu handles this
    }

    // Intercept Backspace for empty TipTap blocks to delete them
    if (e.key === 'Backspace' && (block.content === '<p></p>' || block.content.trim() === '')) {
      e.preventDefault();
      deleteBlock(block.id);
      return;
    }

    const isTextarea = el && el.tagName === 'TEXTAREA';
    if (!isTextarea) return; // TipTap handles its own Enter/Backspace/Arrow navigation

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setSlashMenu(null);

      // Divider doesn't need a new block focus
      if (block.type === 'divider') {
        insertBlockAfter(block.id);
        return;
      }

      // Split block at cursor
      const cursor = el.selectionStart ?? el.value.length;
      const before = el.value.slice(0, cursor);
      const after = el.value.slice(cursor);

      el.value = before; // Force sync DOM to prevent UI duplication bug
      updateBlock(block.id, { content: before });
      const newType: BlockType =
        block.type === 'bulletList' || block.type === 'numberedList' ? block.type : 'paragraph';
      const newId = uid();
      const newBlock: Block = { id: newId, type: newType, content: after, data: block.data };

      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === block.id);
        const next = [...prev];
        next[idx] = { ...block, content: before };
        next.splice(idx + 1, 0, newBlock);
        return next;
      });
      focusBlock(newId, false);
      return;
    }

    if (e.key === 'Backspace') {
      const cursor = el.selectionStart;
      if (cursor === 0 && el.selectionEnd === 0) {
        e.preventDefault();
        setSlashMenu(null);

        // If block has content, merge with previous
        setBlocks(prev => {
          const idx = prev.findIndex(b => b.id === block.id);
          if (idx === 0) {
            // First block: if not paragraph, convert to paragraph
            if (block.type !== 'paragraph') {
              return prev.map(b => b.id === block.id ? { ...b, type: 'paragraph' } : b);
            }
            return prev;
          }
          const prevBlock = prev[idx - 1];
          const mergedContent = prevBlock.content + block.content;
          const next = prev.filter(b => b.id !== block.id);
          const updatedPrev = next.map(b =>
            b.id === prevBlock.id ? { ...b, content: mergedContent } : b,
          );
          // Focus previous block at merge point
          setTimeout(() => {
            const prevEl = textareaRefs.current.get(prevBlock.id);
            if (prevEl) {
              prevEl.focus();
              const pos = prevBlock.content.length;
              prevEl.selectionStart = prevEl.selectionEnd = pos;
              prevEl.value = mergedContent; // Force sync DOM
              autoResize(prevEl);
            }
          }, 10);
          return updatedPrev;
        });
      }
    }

    // Arrow up at first line → focus previous block
    if (e.key === 'ArrowUp') {
      const cursor = el.selectionStart ?? 0;
      if (cursor === 0) {
        setBlocks(prev => {
          const idx = prev.findIndex(b => b.id === block.id);
          if (idx > 0) setTimeout(() => focusBlock(prev[idx - 1].id), 10);
          return prev;
        });
      }
    }

    // Arrow down at last line → focus next block
    if (e.key === 'ArrowDown') {
      const cursor = el.selectionStart ?? 0;
      if (cursor === el.value.length) {
        setBlocks(prev => {
          const idx = prev.findIndex(b => b.id === block.id);
          if (idx < prev.length - 1) setTimeout(() => focusBlock(prev[idx + 1].id), 10);
          return prev;
        });
      }
    }
  }, [slashMenu, insertBlockAfter, updateBlock, focusBlock]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>, block: Block) => {
    const el = e.currentTarget;
    const value = el.value;
    autoResize(el);

    // ── Slash menu detection ──────────────────────────────
    const cursor = el.selectionStart ?? value.length;
    const textBefore = value.slice(0, cursor);
    const slashIdx = textBefore.lastIndexOf('/');
    
    if (slashIdx !== -1 && (slashIdx === 0 || textBefore[slashIdx - 1] === '\n')) {
      const query = textBefore.slice(slashIdx + 1);
      if (!query.includes(' ')) {
        const rect = el.getBoundingClientRect();
        setSlashMenu({
          blockId: block.id,
          query,
          position: { top: rect.bottom + 4, left: rect.left },
        });
        updateBlock(block.id, { content: value });
        return;
      }
    }
    setSlashMenu(null);

    // ── Markdown shortcut detection ────────────────────────
    const newType = detectMarkdown(value);
    if (newType) {
      if (newType === 'divider') {
        updateBlock(block.id, { type: 'divider', content: '' });
        return;
      }
      updateBlock(block.id, { type: newType, content: '' });
      setTimeout(() => {
        const el2 = textareaRefs.current.get(block.id);
        if (el2) { el2.value = ''; el2.style.height = 'auto'; }
      }, 10);
      return;
    }

    updateBlock(block.id, { content: value });
  }, [autoResize, updateBlock]);

  const handleSlashSelect = useCallback((type: BlockType) => {
    if (!slashMenu) return;
    const { blockId } = slashMenu;
    setSlashMenu(null);

    if (type === 'divider') {
      updateBlock(blockId, { type: 'divider', content: '' });
      insertBlockAfter(blockId);
      return;
    }

    const initialData = type === 'table' ? {
      title: '',
      header: [{ text: '欄位 1' }, { text: '欄位 2' }],
      rows: [
        { cells: [{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }] },
        { cells: [{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }] }
      ]
    } : undefined;

    // Clear the "/" text and switch type
    const el = textareaRefs.current.get(blockId);
    if (el) {
      // Remove the /query part
      const cursor = el.selectionStart ?? 0;
      const textBefore = el.value.slice(0, cursor);
      const slashIdx = textBefore.lastIndexOf('/');
      const newContent = el.value.slice(0, slashIdx);
      updateBlock(blockId, { type, content: newContent, data: initialData });
      setTimeout(() => {
        const el2 = textareaRefs.current.get(blockId);
        if (el2) {
          el2.value = newContent;
          el2.selectionStart = el2.selectionEnd = newContent.length;
          autoResize(el2);
        }
      }, 10);
    } else {
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === blockId);
        if (idx === -1) return prev;
        let newContent = prev[idx].content;
        newContent = newContent.replace(/\/[^/<]*?(<\/p>)$/, '$1');
        const next = [...prev];
        next[idx] = { ...prev[idx], type, content: newContent, data: initialData };
        return next;
      });
    }
    focusBlock(blockId);
  }, [slashMenu, updateBlock, insertBlockAfter, focusBlock, autoResize]);

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="relative w-full min-h-[400px]">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="relative group"
          onMouseEnter={() => setHoveredBlock(block.id)}
          onMouseLeave={() => setHoveredBlock(null)}
        >
          {/* ── + Button ── */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              setSlashMenu({
                blockId: block.id,
                query: '',
                position: { top: rect.bottom + 4, left: rect.left + 24 },
              });
            }}
            className={`absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-all text-lg font-light leading-none ${
              hoveredBlock === block.id ? 'opacity-100' : 'opacity-0'
            }`}
            tabIndex={-1}
            title="在下方新增區塊"
          >
            +
          </button>

          {/* ── Block Toolbar ── */}
          <div className={`absolute right-1 top-1 flex flex-col gap-1 bg-white border border-gray-200 rounded-lg shadow-md p-1 z-10 transition-opacity ${hoveredBlock === block.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <button onClick={() => moveBlockUp(block.id)} className="w-8 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 font-bold" title="上移 (Move Up)">↑</button>
             <button onClick={() => moveBlockDown(block.id)} className="w-8 h-7 flex items-center justify-center hover:bg-gray-100 rounded text-gray-500 font-bold" title="下移 (Move Down)">↓</button>
             <div className="w-full h-px bg-gray-100 my-0.5"></div>
             <button onClick={() => insertBlockAbove(block.id)} className="w-8 h-7 flex items-center justify-center hover:bg-amber-50 text-amber-600 rounded text-xs font-bold" title="在上方插入 (Insert Above)">+↑</button>
             <button onClick={() => insertBlockAfter(block.id)} className="w-8 h-7 flex items-center justify-center hover:bg-amber-50 text-amber-600 rounded text-xs font-bold" title="在下方插入 (Insert Below)">+↓</button>
             {block.type !== 'paragraph' && (
               <>
                 <div className="w-full h-px bg-gray-100 my-0.5"></div>
                 <button onClick={() => deleteBlock(block.id)} className="w-8 h-7 flex items-center justify-center hover:bg-red-50 text-red-500 rounded text-xs" title="刪除區塊 (Delete Block)">🗑️</button>
               </>
             )}
          </div>

          {/* ── Block Type Label ── */}
          {hoveredBlock === block.id && block.type !== 'paragraph' && block.type !== 'divider' && (
            <span className="absolute -left-8 -top-5 text-[10px] text-gray-300 font-medium whitespace-nowrap select-none pointer-events-none">
              {block.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            </span>
          )}

          {/* ── Divider Block ── */}
          {block.type === 'divider' ? (
            <div
              className="py-4 cursor-pointer"
              onClick={() => {
                const idx = blocks.findIndex(b => b.id === block.id);
                if (idx < blocks.length - 1) focusBlock(blocks[idx + 1].id);
                else insertBlockAfter(block.id);
              }}
            >
              <hr className="border-gray-200" />
            </div>
          ) : (
            /* ── Text Block ── */
            <div className="relative">
              {/* Bullet/number prefix */}
              {block.type === 'bulletList' && (
                <span className="absolute left-0 top-[3px] text-gray-400 select-none pointer-events-none text-[17px]">
                  •
                </span>
              )}
              {block.type === 'numberedList' && (
                <span className="absolute left-0 top-[3px] text-gray-400 select-none pointer-events-none text-[17px]">
                  {blocks.filter(
                    (b, bi) =>
                      b.type === 'numberedList' &&
                      bi <= blocks.findIndex(b2 => b2.id === block.id),
                  ).length}.
                </span>
              )}

              {block.type === 'map' && <div className="text-xs font-semibold text-gray-500 mb-1 tracking-wider uppercase">📍 Google Maps Embed HTML</div>}
              {block.type === 'video' && <div className="text-xs font-semibold text-gray-500 mb-1 tracking-wider uppercase">▶️ Video URL</div>}

              {block.type === 'image' ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🖼️</span>
                    <span className="text-xs font-bold text-gray-600 tracking-wider uppercase">單張圖片 (Image)</span>
                  </div>
                  {block.data?.image?.url ? (
                    <div className="relative group rounded-md overflow-hidden bg-gray-100 flex justify-center w-full max-h-[400px]">
                      <img src={block.data.image.url} alt="" className="object-contain max-h-[400px]" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {onUploadImage && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                                if (input) input.click();
                              }}
                              className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:scale-105 transition-transform"
                            >
                              更換圖片
                            </button>
                            <input type="file" accept="image/*" className="hidden" onChange={async e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const res = await onUploadImage(file);
                              if (res) updateBlock(block.id, { data: { image: { id: res.id, url: res.url } } });
                            }} />
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white/50 hover:border-amber-400 transition-colors">
                      {onUploadImage ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                              if (input) input.click();
                            }}
                            className="cursor-pointer bg-amber-50 text-amber-700 px-4 py-2 rounded-md text-sm font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
                          >
                            上傳圖片
                          </button>
                          <input type="file" accept="image/*" className="hidden" onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const res = await onUploadImage(file);
                            if (res) updateBlock(block.id, { data: { image: { id: res.id, url: res.url } } });
                          }} />
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">圖片上傳未啟用</span>
                      )}
                    </div>
                  )}
                  <textarea
                    ref={el => {
                      if (el) textareaRefs.current.set(block.id, el);
                      else textareaRefs.current.delete(block.id);
                    }}
                    value=""
                    onChange={() => {}}
                    onKeyDown={e => handleKeyDown(e, block)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                </div>
              ) : block.type === 'button' ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🖱️</span>
                    <span className="text-xs font-bold text-gray-600 tracking-wider uppercase">按鈕 (Button)</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="按鈕文字 (例：訂閱電子報)"
                      value={block.data?.text || ''}
                      onChange={e => updateBlock(block.id, { data: { ...block.data, text: e.target.value } })}
                      className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="連結網址 (URL)"
                      value={block.data?.url || ''}
                      onChange={e => updateBlock(block.id, { data: { ...block.data, url: e.target.value } })}
                      className="flex-[2] border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400 font-medium"
                    />
                  </div>
                  <textarea
                    ref={el => {
                      if (el) textareaRefs.current.set(block.id, el);
                      else textareaRefs.current.delete(block.id);
                    }}
                    value=""
                    onChange={() => {}}
                    onKeyDown={e => handleKeyDown(e, block)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                </div>
              ) : block.type === 'callout' ? (
                <div className="my-2 flex gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-5 group/callout transition-colors hover:border-stone-300">
                  <div className="flex-shrink-0 text-xl leading-none pt-0.5 relative">
                    <input 
                      className="w-7 h-7 bg-transparent border-none text-center outline-none cursor-pointer p-0"
                      value={block.data?.icon || '💡'}
                      onChange={e => {
                        let val = e.target.value;
                        if (val.length > 2) val = val.slice(-2); // naive emoji picker
                        updateBlock(block.id, { data: { ...block.data, icon: val } });
                      }}
                      title="點擊更換 Emoji"
                    />
                  </div>
                  <div className="flex-1">
                    <TipTapBlock
                      content={block.data?.textHtml || ''}
                      placeholder="輸入提示內容..."
                      className="text-stone-700 text-[15px] leading-relaxed"
                      onChange={html => updateBlock(block.id, { data: { ...block.data, textHtml: html } })}
                      onKeyDown={(e, html) => {
                        if (e.key === 'Backspace' && (html === '<p></p>' || html.trim() === '')) {
                          e.preventDefault();
                          deleteBlock(block.id);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : block.type === 'toggle' ? (
                <div className="my-2 group border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-3 py-2">
                    <span className="text-stone-400 group-open:rotate-90 transition-transform duration-200 flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                    <input 
                      type="text"
                      className="flex-1 bg-transparent outline-none font-medium text-stone-800 placeholder-stone-400"
                      placeholder="折疊列表標題..."
                      value={block.data?.title || ''}
                      onChange={e => updateBlock(block.id, { data: { ...block.data, title: e.target.value } })}
                    />
                  </div>
                  <div className="pl-8 pb-3 pt-1">
                    <TipTapBlock
                      content={block.data?.textHtml || ''}
                      placeholder="輸入隱藏內容..."
                      className="text-stone-600 text-[15px] leading-relaxed"
                      onChange={html => updateBlock(block.id, { data: { ...block.data, textHtml: html } })}
                      onKeyDown={(e, html) => {
                        if (e.key === 'Backspace' && (html === '<p></p>' || html.trim() === '')) {
                          e.preventDefault();
                          deleteBlock(block.id);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : block.type === 'product' ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🛍️</span>
                    <span className="text-xs font-bold text-gray-600 tracking-wider uppercase">商品輪播 (Products Carousel)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="推薦區塊標題 (例如：虎航登機箱推薦)"
                    value={block.data?.sectionTitle || ''}
                    onChange={e => updateBlock(block.id, { data: { ...block.data, sectionTitle: e.target.value } })}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400 font-bold"
                  />
                  
                  {/* Items List */}
                  <div className="flex flex-col gap-4">
                    {(block.data?.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 relative shadow-sm">
                        <div className="absolute right-2 top-2">
                          <button onClick={() => {
                            const newItems = [...(block.data?.items || [])];
                            newItems.splice(idx, 1);
                            updateBlock(block.id, { data: { ...block.data, items: newItems } });
                          }} className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 bg-gray-50 rounded">移除</button>
                        </div>
                        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">商品 {idx + 1}</h4>
                        <div className="flex flex-col gap-3">
                          <input
                            type="text"
                            placeholder="商品名稱"
                            value={item.productName || ''}
                            onChange={e => {
                              const newItems = [...(block.data?.items || [])];
                              newItems[idx] = { ...item, productName: e.target.value };
                              updateBlock(block.id, { data: { ...block.data, items: newItems } });
                            }}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            placeholder="價格或售價 (例如：NT$ 1,200)"
                            value={item.price || ''}
                            onChange={e => {
                              const newItems = [...(block.data?.items || [])];
                              newItems[idx] = { ...item, price: e.target.value };
                              updateBlock(block.id, { data: { ...block.data, items: newItems } });
                            }}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400"
                          />
                          <textarea
                            placeholder="推薦理由 / 商品描述"
                            value={item.description || ''}
                            onChange={e => {
                              const newItems = [...(block.data?.items || [])];
                              newItems[idx] = { ...item, description: e.target.value };
                              updateBlock(block.id, { data: { ...block.data, items: newItems } });
                              autoResize(e.target);
                            }}
                            rows={2}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none"
                          />
                          <input
                            type="text"
                            placeholder="購買或介紹連結 (URL)"
                            value={item.link || ''}
                            onChange={e => {
                              const newItems = [...(block.data?.items || [])];
                              newItems[idx] = { ...item, link: e.target.value };
                              updateBlock(block.id, { data: { ...block.data, items: newItems } });
                            }}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400"
                          />
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="圖片網址 (建議用右側按鈕上傳)"
                              value={item.image?.url || ''}
                              onChange={e => {
                                const newItems = [...(block.data?.items || [])];
                                newItems[idx] = { ...item, image: { ...item.image, url: e.target.value, alt: item.productName } };
                                updateBlock(block.id, { data: { ...block.data, items: newItems } });
                              }}
                              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-400"
                            />
                            {onUploadImage && (
                              <label className="cursor-pointer bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors">
                                上傳圖片
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const res = await onUploadImage(file);
                                    if (res) {
                                      const newItems = [...(block.data?.items || [])];
                                      newItems[idx] = { ...item, image: { id: res.id, url: res.url, alt: item.productName } };
                                      updateBlock(block.id, { data: { ...block.data, items: newItems } });
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [...(block.data?.items || []), {}];
                        updateBlock(block.id, { data: { ...block.data, items: newItems } });
                      }}
                      className="w-full py-3 mt-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 font-medium text-sm transition-colors bg-white/50"
                    >
                      + 新增商品 (Add Item)
                    </button>
                  </div>

                  {/* Keep a hidden textarea so navigation logic still works */}
                  <textarea
                    ref={el => {
                      if (el) textareaRefs.current.set(block.id, el);
                      else textareaRefs.current.delete(block.id);
                    }}
                    value=""
                    onChange={() => {}}
                    onKeyDown={e => handleKeyDown(e, block)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                </div>
              ) : block.type === 'toc' ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">📑</span>
                    <span className="text-xs font-bold text-gray-600 tracking-wider uppercase">文章目錄 (Table of Contents)</span>
                  </div>
                  <div className="text-sm text-gray-500">目錄將在此處自動產生，列出文章中所有的 H1 與 H2 標題。</div>
                  <textarea
                    ref={el => {
                      if (el) textareaRefs.current.set(block.id, el);
                      else textareaRefs.current.delete(block.id);
                    }}
                    value=""
                    onChange={() => {}}
                    onKeyDown={e => handleKeyDown(e, block)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                </div>
              ) : block.type === 'table' ? (
                <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📊</span>
                      <span className="text-xs font-bold text-gray-600 tracking-wider uppercase">資料表格 (Table)</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const newData = { ...block.data };
                          newData.header.push({ text: `欄位 ${newData.header.length + 1}` });
                          newData.rows.forEach((r: any) => r.cells.push({ text: '', imageUrl: '' }));
                          updateBlock(block.id, { data: newData });
                        }}
                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 hover:text-amber-600 transition-colors"
                      >+ 新增欄位</button>
                      <button 
                        onClick={() => {
                          const newData = { ...block.data };
                          const newRow = { cells: newData.header.map(() => ({ text: '', imageUrl: '' })) };
                          newData.rows.push(newRow);
                          updateBlock(block.id, { data: newData });
                        }}
                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 hover:text-amber-600 transition-colors"
                      >+ 新增列</button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="表格標題 (可選)"
                    value={block.data?.title || ''}
                    onChange={e => updateBlock(block.id, { data: { ...block.data, title: e.target.value } })}
                    className="w-full border border-transparent bg-transparent font-medium px-2 py-1 text-[15px] outline-none focus:border-amber-400 focus:bg-white focus:rounded-md transition-all placeholder-gray-400"
                  />
                  
                  <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
                    <table className="w-full text-sm text-left min-w-[600px] border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                        <tr>
                          {block.data?.header?.map((h: any, i: number) => (
                            <th key={i} className="border-r border-gray-200 last:border-r-0 p-3 relative group min-w-[150px]">
                            <input 
                              type="text" 
                              value={h.text} 
                              onChange={e => {
                                const newData = { ...block.data };
                                newData.header[i].text = e.target.value;
                                updateBlock(block.id, { data: newData });
                              }}
                              className="w-full bg-transparent outline-none font-semibold text-gray-800"
                              placeholder="表頭名稱"
                            />
                            {block.data.header.length > 1 && (
                              <button 
                                onClick={() => {
                                  const newData = { ...block.data };
                                  newData.header.splice(i, 1);
                                  newData.rows.forEach((r: any) => r.cells.splice(i, 1));
                                  updateBlock(block.id, { data: newData });
                                }}
                                className="absolute top-1 right-1 text-[10px] bg-red-100 text-red-600 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="刪除此欄"
                              >×</button>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.data?.rows?.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="border-b border-gray-100 last:border-b-0 hover:bg-amber-50/30 transition-colors">
                          {row.cells?.map((cell: any, cIdx: number) => (
                            <td key={cIdx} className="border-r border-gray-100 last:border-r-0 p-3 relative group align-top">
                              <TipTapBlock 
                                content={cell.text}
                                placeholder="輸入內容..."
                                className="min-h-[40px] text-gray-600 text-[14px]"
                                onChange={html => {
                                  const newData = { ...block.data };
                                  newData.rows[rIdx].cells[cIdx].text = html;
                                  updateBlock(block.id, { data: newData });
                                }}
                              />
                              <div className="flex gap-2 mt-2">
                                <input 
                                  type="text" 
                                  placeholder="圖片網址 (可選)"
                                  value={cell.imageUrl || ''}
                                  onChange={e => {
                                    const newData = { ...block.data };
                                    newData.rows[rIdx].cells[cIdx].imageUrl = e.target.value;
                                    updateBlock(block.id, { data: newData });
                                  }}
                                  className="flex-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none focus:border-amber-400"
                                />
                                {onUploadImage && (
                                  <>
                                    <label className="cursor-pointer bg-white text-gray-500 hover:text-amber-600 border border-gray-200 rounded px-2 py-1 text-xs flex items-center justify-center transition-colors" title="上傳圖片">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async e => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const res = await onUploadImage(file);
                                          if (res) {
                                            const newData = { ...block.data };
                                            newData.rows[rIdx].cells[cIdx].imageUrl = res.url;
                                            updateBlock(block.id, { data: newData });
                                          }
                                        }}
                                      />
                                    </label>
                                  </>
                                )}
                              </div>
                            </td>
                          ))}
                          {/* Row Delete Button (shown when hovering row) */}
                          {block.data.rows.length > 1 && (
                            <td className="w-8 border-none p-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  const newData = { ...block.data };
                                  newData.rows.splice(rIdx, 1);
                                  updateBlock(block.id, { data: newData });
                                }}
                                className="text-red-500 hover:text-red-700 text-[10px] w-5 h-5 bg-red-50 rounded-full inline-flex items-center justify-center m-1"
                                title="刪除列"
                              >✕</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  <textarea
                    ref={el => {
                      if (el) textareaRefs.current.set(block.id, el);
                      else textareaRefs.current.delete(block.id);
                    }}
                    value=""
                    onChange={() => {}}
                    onKeyDown={e => handleKeyDown(e, block)}
                    className="w-0 h-0 opacity-0 absolute"
                  />
                </div>
              ) : (
                <>
                  {block.type === 'code' && (
                    <div className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity z-10">
                      <select
                        value={block.data?.language || ''}
                        onChange={e => updateBlock(block.id, { data: { ...block.data, language: e.target.value } })}
                        className="text-[11px] font-bold tracking-wider uppercase bg-white border border-gray-200 rounded px-2 py-1 text-gray-500 hover:text-amber-600 outline-none shadow-sm cursor-pointer"
                      >
                        <option value="">Plain Text</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="cmd">CMD / Bash</option>
                      </select>
                    </div>
                  )}
                  {(block.type === 'code' || block.type === 'map' || block.type === 'video') ? (
                    <textarea
                      ref={el => {
                        if (el) textareaRefs.current.set(block.id, el);
                        else textareaRefs.current.delete(block.id);
                      }}
                      defaultValue={block.content}
                      placeholder={BLOCK_PLACEHOLDER[block.type]}
                      rows={1}
                      onKeyDown={e => handleKeyDown(e, block)}
                      onChange={e => handleInput(e, block)}
                      onFocus={e => autoResize(e.target)}
                      className={[
                        'w-full resize-none overflow-hidden outline-none bg-transparent placeholder-gray-300 transition-colors',
                        'border-none focus:ring-0 p-0',
                        BLOCK_STYLE[block.type],
                        'w-full focus:bg-white focus:border-amber-200 focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                      ].join(' ')}
                      style={{ minHeight: '1.5em' }}
                      spellCheck={false}
                    />
                  ) : (
                    <TipTapBlock
                      key={`${block.id}-${block.type}`}
                      content={block.content}
                      placeholder={BLOCK_PLACEHOLDER[block.type]}
                      className={[
                        BLOCK_STYLE[block.type],
                        (block.type === 'bulletList' || block.type === 'numberedList') ? 'pl-6' : '',
                      ].join(' ')}
                      autoFocus={focusId === block.id}
                      onChange={(html) => {
                        updateBlock(block.id, { content: html });
                        // Trigger autosize update on parent if needed
                      }}
                      onSplit={(firstHtml, restHtmls) => {
                        updateBlock(block.id, { content: firstHtml });
                        const newType: BlockType = (block.type === 'bulletList' || block.type === 'numberedList') ? block.type : 'paragraph';
                        const newBlocks = restHtmls.map(html => ({ id: uid(), type: newType, content: html, data: block.data }));
                        
                        setBlocks(prev => {
                          const idx = prev.findIndex(b => b.id === block.id);
                          const next = [...prev];
                          next.splice(idx + 1, 0, ...newBlocks);
                          return next;
                        });
                        
                        if (newBlocks.length > 0) {
                          focusBlock(newBlocks[0].id, false);
                        }
                      }}
                      onKeyDown={(e, html) => {
                        // Forward keyboard events (like Enter, Backspace) to parent logic
                        handleKeyDown(e as any, { ...block, content: html });
                      }}
                      onSlashMenu={(query, rect) => {
                        setSlashMenu({ query, position: { top: rect.bottom, left: rect.left }, blockId: block.id });
                      }}
                      onSlashClose={() => setSlashMenu(null)}
                      onMarkdownShortcut={(shortcut) => {
                        const newType = detectMarkdown(`${shortcut} `);
                        if (newType) {
                          // Change block type and clear its content
                          updateBlock(block.id, { type: newType, content: '' });
                          // Force focus after re-render
                          setTimeout(() => focusBlock(block.id, false), 50);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* ── Slash Menu ── */}
      {slashMenu && (
        <SlashMenu
          query={slashMenu.query}
          position={slashMenu.position}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenu(null)}
        />
      )}
    </div>
  );
}
