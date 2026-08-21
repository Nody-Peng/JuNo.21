// Converts the custom block editor format into Payload CMS Lexical JSON

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'quote'
  | 'code'
  | 'divider'
  | 'bulletList'
  | 'numberedList'
  | 'map'
  | 'video'
  | 'product'
  | 'table'
  | 'image'
  | 'button'
  | 'toc'
  | 'callout'
  | 'toggle';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  data?: any;
}

// ─── Block → Lexical ─────────────────────────────────────────

function makeText(text: string, format: number = 0) {
  return { type: 'text', text, version: 1, format, detail: 0, mode: 'normal', style: '' };
}

function parseHTMLToLexicalNodes(html: string) {
  if (typeof window === 'undefined') return [makeText(html.replace(/<[^>]+>/g, '') || '')];

  let doc;
  if (typeof DOMParser !== 'undefined') {
    doc = new DOMParser().parseFromString(html, 'text/html');
  } else {
    return [makeText(html.replace(/<[^>]+>/g, '') || '')];
  }

  const nodes: any[] = [];
  
  function walk(element: Node, currentFormat: number = 0, currentColor: string | null = null) {
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) {
          const textNode = makeText(child.textContent, currentFormat);
          if (currentColor) {
            textNode.style = `color: ${currentColor}`;
          }
          nodes.push(textNode);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        let format = currentFormat;
        let color = currentColor;
        
        if (el.tagName === 'STRONG' || el.tagName === 'B') format |= 1;
        if (el.tagName === 'EM' || el.tagName === 'I') format |= 2;
        if (el.tagName === 'S' || el.tagName === 'STRIKE' || el.tagName === 'DEL') format |= 8;
        
        if (el.tagName === 'SPAN' && el.style.color) {
          color = el.style.color;
        }
        
        if (el.tagName === 'A') {
          const localNodes: any[] = [];
          const oldPush = nodes.push;
          nodes.push = (...args: any[]) => localNodes.push(...args);
          walk(el, format, color);
          nodes.push = oldPush;
          
          nodes.push({
            type: 'link',
            version: 2,
            direction: 'ltr',
            format: '',
            indent: 0,
            fields: {
              linkType: 'custom',
              url: (el as HTMLAnchorElement).href || el.getAttribute('href') || '',
              newTab: true,
            },
            children: localNodes.length ? localNodes : [makeText('')],
          });
          continue;
        }

        if (el.tagName === 'BR') {
          nodes.push({ type: 'linebreak', version: 1 });
          continue;
        }

        if (el.tagName === 'P' || el.tagName === 'DIV') {
          if (nodes.length > 0) {
            nodes.push({ type: 'linebreak', version: 1 });
          }
        }
        
        walk(el, format, color);
      }
    }
  }

  walk(doc.body);
  return nodes.length > 0 ? nodes : [makeText('')];
}

function makeParagraph(text: string) {
  return {
    type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0,
    children: parseHTMLToLexicalNodes(text),
  };
}

function makeHeading(text: string, tag: 'h1' | 'h2' | 'h3') {
  return {
    type: 'heading', tag, version: 1, direction: 'ltr', format: '', indent: 0,
    children: parseHTMLToLexicalNodes(text),
  };
}

function makeQuote(text: string) {
  return {
    type: 'quote', version: 1, direction: 'ltr', format: '', indent: 0,
    children: parseHTMLToLexicalNodes(text),
  };
}

function makeCode(text: string, language: string = '') {
  return {
    type: 'code', version: 1, direction: 'ltr', format: '', indent: 0, language,
    children: text ? [makeText(text)] : [], // No links in code block
  };
}

function makeListItem(text: string) {
  return {
    type: 'listitem', version: 1, value: 1, format: '', indent: 0, direction: 'ltr',
    children: parseHTMLToLexicalNodes(text),
  };
}

export function blocksToLexical(blocks: Block[]) {
  const nodes: unknown[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === 'bulletList' || block.type === 'numberedList') {
      const listType = block.type === 'bulletList' ? 'bullet' : 'number';
      const items: Block[] = [];
      while (i < blocks.length && blocks[i].type === block.type) {
        items.push(blocks[i]);
        i++;
      }
      nodes.push({
        type: 'list', listType, version: 1, start: 1, direction: 'ltr', format: '', indent: 0,
        tag: listType === 'bullet' ? 'ul' : 'ol',
        children: items.map((b, index) => {
          const item = makeListItem(b.content);
          if (listType === 'number') {
            item.value = index + 1;
          }
          return item;
        }),
      });
      continue;
    }

    switch (block.type) {
      case 'heading1': nodes.push(makeHeading(block.content, 'h1')); break;
      case 'heading2': nodes.push(makeHeading(block.content, 'h2')); break;
      case 'heading3': nodes.push(makeHeading(block.content, 'h3')); break;
      case 'quote':    nodes.push(makeQuote(block.content)); break;
      case 'code':     nodes.push(makeCode(block.content, block.data?.language || '')); break;
      case 'divider':
        nodes.push({ type: 'horizontalrule', version: 1 });
        break;
      case 'map':
        nodes.push({ type: 'block', fields: { blockType: 'map', embedHtml: block.content }, format: '', version: 2 });
        break;
      case 'video':
        nodes.push({ type: 'block', fields: { blockType: 'video', url: block.content }, format: '', version: 2 });
        break;
      case 'product': {
        const payloadData = { ...(block.data || {}) };
        if (payloadData.items && Array.isArray(payloadData.items)) {
          payloadData.items = payloadData.items
            .filter((item: any) => item.productName || item.description || item.price || item.link || item.image?.url)
            .map((item: any) => {
              const cleanedItem = { ...item };
              if (cleanedItem.image && typeof cleanedItem.image === 'object') {
                if (cleanedItem.image.id) {
                  cleanedItem.image = cleanedItem.image.id;
                } else {
                  delete cleanedItem.image;
                }
              }
              return cleanedItem;
            });
        }
        nodes.push({ type: 'block', fields: { blockType: 'product', ...payloadData }, format: '', version: 2 });
        break;
      }
      case 'table':
        nodes.push({ type: 'block', fields: { blockType: 'table', ...(block.data || {}) }, format: '', version: 2 });
        break;
      case 'image':
        if (block.data?.image?.id) {
          nodes.push({
            type: 'upload',
            relationTo: 'media',
            value: { id: block.data.image.id },
            format: '',
            version: 1,
          });
        }
        break;
      case 'button':
        nodes.push({ type: 'block', fields: { blockType: 'button', ...(block.data || {}) }, format: '', version: 2 });
        break;
      case 'toc':
        nodes.push({ type: 'block', fields: { blockType: 'toc' }, format: '', version: 2 });
        break;
      case 'callout':
        nodes.push({ type: 'block', fields: { blockType: 'callout', ...(block.data || {}) }, format: '', version: 2 });
        break;
      case 'toggle':
        nodes.push({ type: 'block', fields: { blockType: 'toggle', ...(block.data || {}) }, format: '', version: 2 });
        break;
      default: nodes.push(makeParagraph(block.content));
    }
    i++;
  }

  return {
    root: {
      type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
      children: nodes.length ? nodes : [makeParagraph('')],
    },
  };
}

// ─── Lexical → Block ─────────────────────────────────────────

function extractHTML(children: any[]): string {
  if (!children) return '';
  return children.map(c => {
    if (c.type === 'link') {
      const linkHtml = extractHTML(c.children || []);
      const url = c.fields?.url || '';
      return `<a href="${url}">${linkHtml}</a>`;
    }
    if (c.type === 'linebreak') {
      return '<br>';
    }
    let html = c.text || '';
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    if (c.format & 1) html = `<strong>${html}</strong>`;
    if (c.format & 2) html = `<em>${html}</em>`;
    if (c.format & 8) html = `<s>${html}</s>`;
    
    if (c.style && c.style.includes('color:')) {
      const match = c.style.match(/color:\s*([^;]+)/);
      if (match) {
        html = `<span style="color: ${match[1]}">${html}</span>`;
      }
    }
    return html;
  }).join('');
}

function extractPlainText(children: any[]): string {
  if (!children) return '';
  return children.map(c => {
    if (c.type === 'link') {
      return extractPlainText(c.children || []);
    }
    return c.text || '';
  }).join('');
}

export function lexicalToBlocks(lexical: { root?: { children?: unknown[] } }): Block[] {
  if (!lexical?.root?.children?.length) {
    return [{ id: uid(), type: 'paragraph', content: '' }];
  }

  const blocks: Block[] = [];

  for (const node of lexical.root.children as Record<string, unknown>[]) {
    const htmlText = extractHTML((node.children as any[]) || []);
    const plainText = extractPlainText((node.children as any[]) || []);

    if (node.type === 'heading') {
      const tagMap: Record<string, BlockType> = { h1: 'heading1', h2: 'heading2', h3: 'heading3' };
      blocks.push({ id: uid(), type: tagMap[node.tag as string] || 'heading1', content: htmlText });
    } else if (node.type === 'quote') {
      blocks.push({ id: uid(), type: 'quote', content: htmlText });
    } else if (node.type === 'code') {
      blocks.push({ id: uid(), type: 'code', content: plainText, data: { language: (node as any).language || '' } });
    } else if (node.type === 'horizontalrule') {
      blocks.push({ id: uid(), type: 'divider', content: '' });
    } else if (node.type === 'list') {
      const listType = (node as any).listType === 'number' ? 'numberedList' : 'bulletList';
      for (const item of ((node as any).children || [])) {
        blocks.push({ id: uid(), type: listType, content: extractHTML(item.children || []) });
      }
    } else if (node.type === 'paragraph') {
      blocks.push({ id: uid(), type: 'paragraph', content: htmlText });
    } else if (node.type === 'block') {
      const fields = node.fields as any;
      if (fields?.blockType === 'map') {
        blocks.push({ id: uid(), type: 'map', content: fields.embedHtml || '' });
      } else if (fields?.blockType === 'video') {
        blocks.push({ id: uid(), type: 'video', content: fields.url || '' });
      } else if (fields?.blockType === 'product') {
        blocks.push({ id: uid(), type: 'product', content: '', data: fields });
      } else if (fields?.blockType === 'table') {
        blocks.push({ id: uid(), type: 'table', content: '', data: fields });
      } else if (fields?.blockType === 'button') {
        blocks.push({ id: uid(), type: 'button', content: '', data: fields });
      } else if (fields?.blockType === 'toc') {
        blocks.push({ id: uid(), type: 'toc', content: '' });
      } else if (fields?.blockType === 'callout') {
        blocks.push({ id: uid(), type: 'callout', content: '', data: fields });
      } else if (fields?.blockType === 'toggle') {
        blocks.push({ id: uid(), type: 'toggle', content: '', data: fields });
      }
    } else if (node.type === 'upload' && node.relationTo === 'media') {
      const mediaDoc = node.value as any;
      blocks.push({ id: uid(), type: 'image', content: '', data: { image: mediaDoc } });
    } else {
      blocks.push({ id: uid(), type: 'paragraph', content: htmlText });
    }
  }

  return blocks.length ? blocks : [{ id: uid(), type: 'paragraph', content: '' }];
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
