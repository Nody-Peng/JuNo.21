'use client';
import { useEffect, useRef } from 'react';
import type { BlockType } from '@/lib/blocks-to-lexical';

interface SlashItem {
  type: BlockType;
  icon: string;
  label: string;
  desc: string;
  shortcut?: string;
}

export const SLASH_ITEMS: SlashItem[] = [
  { type: 'paragraph',    icon: '¶',  label: '文字段落',  desc: '一般段落文字',       shortcut: 'Enter' },
  { type: 'heading1',     icon: 'H1', label: '大標題',    desc: '最大的標題',          shortcut: '#' },
  { type: 'heading2',     icon: 'H2', label: '中標題',    desc: '第二層標題',          shortcut: '##' },
  { type: 'heading3',     icon: 'H3', label: '小標題',    desc: '第三層標題',          shortcut: '###' },
  { type: 'quote',        icon: '❝',  label: '引用',      desc: '引用文字區塊',        shortcut: '>' },
  { type: 'code',         icon: '<>', label: '程式碼',    desc: '程式碼區塊',          shortcut: '```' },
  { type: 'divider',      icon: '—',  label: '分隔線',    desc: '水平分隔線',          shortcut: '---' },
  { type: 'bulletList',   icon: '•',  label: '無序列表',  desc: '帶圓點的清單',        shortcut: '-' },
  { type: 'numberedList', icon: '1.', label: '有序列表',  desc: '帶數字的清單',        shortcut: '1.' },
];

interface Props {
  query: string;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export default function SlashMenu({ query, position, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const filtered = SLASH_ITEMS.filter(
    item =>
      !query ||
      item.label.includes(query) ||
      item.type.toLowerCase().includes(query.toLowerCase()),
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!filtered.length) return null;

  return (
    <div
      ref={ref}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[9999] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      <div className="px-3 pt-2 pb-1 text-xs text-gray-400 font-medium tracking-wider uppercase">
        區塊類型
      </div>
      {filtered.map((item, idx) => (
        <button
          key={idx}
          onMouseDown={(e) => { e.preventDefault(); onSelect(item.type); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 transition-colors text-left group"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-amber-100 text-sm font-bold text-gray-600 group-hover:text-amber-700 transition-colors shrink-0">
            {item.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800">{item.label}</div>
            <div className="text-xs text-gray-400">{item.desc}</div>
          </div>
          {item.shortcut && (
            <span className="text-xs text-gray-300 font-mono shrink-0">{item.shortcut}</span>
          )}
        </button>
      ))}
    </div>
  );
}
