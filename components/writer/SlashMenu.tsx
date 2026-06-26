'use client';
import { useEffect, useRef, useState } from 'react';
import type { BlockType } from '@/lib/blocks-to-lexical';

export interface SlashItem {
  type: BlockType;
  icon: React.ReactNode;
  label: string;
  desc: string;
  shortcut?: string;
}

const Icon = ({ children }: { children: React.ReactNode }) => (
  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F5F2EE] text-[#3B2D2A]/60 shrink-0 group-hover:bg-[#3B2D2A] group-hover:text-[#F9F8F6] transition-all duration-150">
    {children}
  </span>
);

const ParagraphIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>;
const H1Icon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/></svg>;
const H2Icon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-2.75 4-4.25 4-6a2 2 0 0 0-4 0"/></svg>;
const H3Icon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>;
const QuoteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>;
const CodeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const DividerIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const ListOrderedIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
const MapIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
const VideoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
const ProductIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const TableIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
const TOCIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>;

const ImageIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
const ButtonIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="3" y="6" rx="3" ry="3"/><path d="M12 12h.01"/></svg>;

export const SLASH_ITEMS: SlashItem[] = [
  { type: 'paragraph',    icon: <Icon><ParagraphIcon /></Icon>,   label: '文字段落',  desc: '一般段落文字',   shortcut: '' },
  { type: 'heading1',     icon: <Icon><H1Icon /></Icon>,  label: '大標題',    desc: '最大的標題',      shortcut: '#' },
  { type: 'heading2',     icon: <Icon><H2Icon /></Icon>,  label: '中標題',    desc: '第二層標題',      shortcut: '##' },
  { type: 'heading3',     icon: <Icon><H3Icon /></Icon>,  label: '小標題',    desc: '第三層標題',      shortcut: '###' },
  { type: 'quote',        icon: <Icon><QuoteIcon /></Icon>,   label: '引用區塊',  desc: '強調引用的文字',  shortcut: '>' },
  { type: 'code',         icon: <Icon><CodeIcon /></Icon>, label: '程式碼',  desc: '等寬程式碼區塊', shortcut: '```' },
  { type: 'divider',      icon: <Icon><DividerIcon /></Icon>,   label: '分隔線',    desc: '水平分隔線',      shortcut: '---' },
  { type: 'bulletList',   icon: <Icon><ListIcon /></Icon>,   label: '無序列表',  desc: '帶圓點的清單',    shortcut: '-' },
  { type: 'numberedList', icon: <Icon><ListOrderedIcon /></Icon>,  label: '有序列表',  desc: '帶數字的清單',    shortcut: '1.' },
  { type: 'table',        icon: <Icon><TableIcon /></Icon>,label: '表格',      desc: '插入資料表格', shortcut: '' },
  { type: 'toc',          icon: <Icon><TOCIcon /></Icon>,label: '文章目錄',  desc: '自動產生標題目錄', shortcut: '' },
  { type: 'map',          icon: <Icon><MapIcon /></Icon>,  label: '地圖',      desc: '嵌入 Google Maps', shortcut: '' },
  { type: 'product',      icon: <Icon><ProductIcon /></Icon>,label: '商品卡片', desc: '嵌入推薦商品區塊', shortcut: '' },
  { type: 'image',        icon: <Icon><ImageIcon /></Icon>,label: '單張圖片', desc: '上傳圖片', shortcut: '' },
  { type: 'button',       icon: <Icon><ButtonIcon /></Icon>,label: '按鈕',     desc: '插入行動呼籲按鈕', shortcut: '' },
];

interface Props {
  query: string;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export default function SlashMenu({ query, position, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);

  const filtered = SLASH_ITEMS.filter(item =>
    !query ||
    item.label.includes(query) ||
    item.type.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { 
        e.preventDefault(); 
        setSelected(s => {
          const next = (s + 1) % filtered.length;
          document.getElementById(`slash-item-${next}`)?.scrollIntoView({ block: 'nearest' });
          return next;
        }); 
      }
      if (e.key === 'ArrowUp') { 
        e.preventDefault(); 
        setSelected(s => {
          const prev = (s - 1 + filtered.length) % filtered.length;
          document.getElementById(`slash-item-${prev}`)?.scrollIntoView({ block: 'nearest' });
          return prev;
        }); 
      }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[selected]) onSelect(filtered[selected].type); }
      if (e.key === 'Escape')    onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler, true);
    };
  }, [onClose, filtered, selected, onSelect]);

  if (!filtered.length) return null;

  // Ensure the menu doesn't go offscreen
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.bottom > windowHeight) {
        ref.current.style.top = `${Math.max(10, position.top - rect.height - 30)}px`;
      }
    }
  }, [position.top, filtered.length]);

  return (
    <div
      ref={ref}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[9999] w-[280px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden py-1.5 flex flex-col max-h-[350px]"
    >
      <p className="px-3.5 pt-1 pb-2 text-[10px] font-semibold text-[#3B2D2A]/35 tracking-[0.12em] uppercase shrink-0">
        區塊類型
      </p>
      <div className="overflow-y-auto custom-scrollbar flex-1">
        {filtered.map((item, idx) => (
          <button
            key={idx}
            id={`slash-item-${idx}`}
            onMouseDown={(e) => { e.preventDefault(); onSelect(item.type); }}
            onMouseEnter={() => setSelected(idx)}
            className={`group w-full flex items-center gap-3 px-3 py-2 transition-colors text-left ${
              selected === idx ? 'bg-[#F5F2EE]' : 'hover:bg-[#F5F2EE]/60'
            }`}
          >
            {item.icon}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[#3B2D2A]">{item.label}</div>
              <div className="text-[11px] text-[#3B2D2A]/40 mt-px">{item.desc}</div>
            </div>
            {item.shortcut && (
              <kbd className="text-[10px] text-[#3B2D2A]/25 font-mono bg-[#3B2D2A]/5 px-1.5 py-0.5 rounded shrink-0">
                {item.shortcut}
              </kbd>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
