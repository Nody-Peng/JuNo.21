'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';

interface TipTapBlockProps {
  content: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onChange: (html: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, html: string) => void;
  onSlashMenu?: (query: string, rect: DOMRect) => void;
  onSlashClose?: () => void;
  onSplit?: (firstHtml: string, restHtmls: string[]) => void;
  onMarkdownShortcut?: (shortcut: string) => void;
}

export default function TipTapBlock({
  content,
  placeholder,
  className,
  autoFocus,
  onChange,
  onKeyDown,
  onSlashMenu,
  onSlashClose,
  onSplit,
  onMarkdownShortcut
}: TipTapBlockProps) {
  const [slashQuery, setSlashQuery] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, 
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        class: `outline-none min-h-[1.5em] w-full ${className || ''}`,
      },
      handleKeyDown: (view, event) => {
        if (onKeyDown) {
          onKeyDown(event as unknown as React.KeyboardEvent, editor?.getHTML() || '');
        }

        // Slash menu detection
        if (event.key === 'Escape') {
          setSlashQuery(null);
          if (onSlashClose) onSlashClose();
          return false;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      
      // Check for multiple root blocks (e.g. user pressed Enter or pasted paragraphs)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const children = Array.from(tempDiv.children);
      
      if (children.length > 1 && onSplit) {
        const firstHtml = children[0].outerHTML;
        const restHtmls = children.slice(1).map(node => node.outerHTML);
        
        // Force TipTap back to the first block immediately to prevent UI jumps
        editor.commands.setContent(firstHtml, { emitUpdate: false });
        
        onSplit(firstHtml, restHtmls);
        return;
      }

      onChange(html);

      // Slash Menu & Markdown Logic
      const { state, view } = editor;
      const { selection } = state;
      const { $head } = selection;
      const textBefore = $head.parent.textContent.slice(0, $head.parentOffset);
      
      const mdMatch = textBefore.match(/^(#|##|###|>|!|\||-|\d+\.)\s$/);
      if (mdMatch && onMarkdownShortcut) {
        onMarkdownShortcut(mdMatch[1]);
        return;
      }

      const slashIdx = textBefore.lastIndexOf('/');
      
      if (slashIdx !== -1 && (slashIdx === 0 || textBefore[slashIdx - 1] === ' ')) {
        const query = textBefore.slice(slashIdx + 1);
        if (!query.includes(' ')) {
          setSlashQuery(query);
          if (onSlashMenu) {
            const coords = view.coordsAtPos($head.pos);
            const rect = {
              bottom: coords.bottom,
              left: coords.left,
              top: coords.top,
              right: coords.right,
              width: 0,
              height: coords.bottom - coords.top,
            } as DOMRect;
            onSlashMenu(query, rect);
          }
          return;
        }
      }
      setSlashQuery(null);
      if (onSlashClose) onSlashClose();
    },
  });

  // Sync content from outside (only if editor is empty, to prevent cursor jumps)
  useEffect(() => {
    if (editor && content !== editor.getHTML() && document.activeElement !== editor.view.dom) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Handle dynamic autofocus
  useEffect(() => {
    if (editor && autoFocus) {
      setTimeout(() => editor.commands.focus('end'), 10);
    }
  }, [editor, autoFocus]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="relative tiptap-wrapper">
      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex items-center bg-gray-900 shadow-xl rounded-xl px-2 py-1.5 space-x-1.5 border border-gray-800"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`w-8 h-8 flex items-center justify-center rounded font-serif font-bold transition-colors ${editor.isActive('bold') ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`w-8 h-8 flex items-center justify-center rounded font-serif italic transition-colors ${editor.isActive('italic') ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`w-8 h-8 flex items-center justify-center rounded line-through transition-colors ${editor.isActive('strike') ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            S
          </button>
          <div className="w-px bg-gray-200 mx-1 my-1"></div>
          <button
            onClick={setLink}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${editor.isActive('link') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            🔗
          </button>
          <div className="w-px bg-gray-200 mx-1 my-1"></div>
          <div className="flex items-center px-1 gap-1">
            <button onClick={() => editor.chain().focus().setColor('#DC2626').run()} className="w-5 h-5 rounded-full bg-red-600 hover:scale-110 transition-transform"></button>
            <button onClick={() => editor.chain().focus().setColor('#D97706').run()} className="w-5 h-5 rounded-full bg-amber-600 hover:scale-110 transition-transform"></button>
            <button onClick={() => editor.chain().focus().setColor('#059669').run()} className="w-5 h-5 rounded-full bg-emerald-600 hover:scale-110 transition-transform"></button>
            <button onClick={() => editor.chain().focus().setColor('#2563EB').run()} className="w-5 h-5 rounded-full bg-blue-600 hover:scale-110 transition-transform"></button>
            <button onClick={() => editor.chain().focus().setColor('#000000').run()} className="w-5 h-5 rounded-full bg-gray-900 hover:scale-110 transition-transform border border-gray-300"></button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
