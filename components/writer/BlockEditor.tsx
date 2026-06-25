'use client';
import {
  useState, useRef, useCallback, useEffect, KeyboardEvent,
} from 'react';
import type { Block, BlockType } from '@/lib/blocks-to-lexical';
import { uid } from '@/lib/blocks-to-lexical';
import SlashMenu from './SlashMenu';

// ─── Types ───────────────────────────────────────────────────

interface Props {
  initialBlocks?: Block[];
  onChange: (blocks: Block[]) => void;
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
};

// ─── Markdown shortcut detection ─────────────────────────────

function detectMarkdown(text: string): BlockType | null {
  if (text === '# ')     return 'heading1';
  if (text === '## ')    return 'heading2';
  if (text === '### ')   return 'heading3';
  if (text === '> ')     return 'quote';
  if (text === '```')    return 'code';
  if (text === '--- ')   return 'divider';
  if (text === '- ')     return 'bulletList';
  if (text === '* ')     return 'bulletList';
  if (text === '1. ')    return 'numberedList';
  return null;
}

// ─── Main Component ──────────────────────────────────────────

export default function BlockEditor({ initialBlocks, onChange }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks?.length ? initialBlocks : [{ id: uid(), type: 'paragraph', content: '' }],
  );
  const [slashMenu, setSlashMenu] = useState<{
    blockId: string;
    query: string;
    position: { top: number; left: number };
  } | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  // Notify parent whenever blocks change
  useEffect(() => {
    onChange(blocks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  // Auto-resize textarea
  const autoResize = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  const focusBlock = useCallback((id: string, atEnd = true) => {
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

      updateBlock(block.id, { content: before });
      const newType: BlockType =
        block.type === 'bulletList' || block.type === 'numberedList' ? block.type : 'paragraph';
      const newId = uid();
      const newBlock: Block = { id: newId, type: newType, content: after };

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

    // Clear the "/" text and switch type
    const el = textareaRefs.current.get(blockId);
    if (el) {
      // Remove the /query part
      const cursor = el.selectionStart ?? 0;
      const textBefore = el.value.slice(0, cursor);
      const slashIdx = textBefore.lastIndexOf('/');
      const newContent = el.value.slice(0, slashIdx);
      updateBlock(blockId, { type, content: newContent });
      setTimeout(() => {
        const el2 = textareaRefs.current.get(blockId);
        if (el2) {
          el2.value = newContent;
          el2.selectionStart = el2.selectionEnd = newContent.length;
          autoResize(el2);
        }
      }, 10);
    } else {
      updateBlock(blockId, { type, content: '' });
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
                  'w-full resize-none overflow-hidden outline-none bg-transparent placeholder-gray-300',
                  'border-none focus:ring-0 p-0',
                  BLOCK_STYLE[block.type],
                  (block.type === 'bulletList' || block.type === 'numberedList') ? 'pl-6' : '',
                  block.type === 'code' ? 'w-full' : '',
                ].join(' ')}
                style={{ minHeight: '1.5em' }}
                spellCheck={block.type !== 'code'}
              />
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
