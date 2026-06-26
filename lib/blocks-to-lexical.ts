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
  | 'toc';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  data?: any;
}

// ─── Block → Lexical ─────────────────────────────────────────

function makeText(text: string) {
  return { type: 'text', text, version: 1, format: 0, detail: 0, mode: 'normal', style: '' };
}

function parseTextWithLinks(text: string) {
  if (!text) return [makeText('')];
  
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(makeText(text.slice(lastIndex, match.index)));
    }
    nodes.push({
      type: 'link',
      version: 2,
      direction: 'ltr',
      format: '',
      indent: 0,
      fields: {
        linkType: 'custom',
        url: match[2],
        newTab: true,
      },
      children: [makeText(match[1])],
    });
    lastIndex = linkRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(makeText(text.slice(lastIndex)));
  }

  return nodes.length > 0 ? nodes : [makeText('')];
}

function makeParagraph(text: string) {
  return {
    type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, textFormat: 0,
    children: parseTextWithLinks(text),
  };
}

function makeHeading(text: string, tag: 'h1' | 'h2' | 'h3') {
  return {
    type: 'heading', tag, version: 1, direction: 'ltr', format: '', indent: 0,
    children: parseTextWithLinks(text),
  };
}

function makeQuote(text: string) {
  return {
    type: 'quote', version: 1, direction: 'ltr', format: '', indent: 0,
    children: parseTextWithLinks(text),
  };
}

function makeCode(text: string) {
  return {
    type: 'code', version: 1, direction: 'ltr', format: '', indent: 0, language: '',
    children: text ? [makeText(text)] : [], // No links in code block
  };
}

function makeListItem(text: string) {
  return {
    type: 'listitem', version: 1, value: 1, format: '', indent: 0, direction: 'ltr',
    children: parseTextWithLinks(text),
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
        children: items.map(b => makeListItem(b.content)),
      });
      continue;
    }

    switch (block.type) {
      case 'heading1': nodes.push(makeHeading(block.content, 'h1')); break;
      case 'heading2': nodes.push(makeHeading(block.content, 'h2')); break;
      case 'heading3': nodes.push(makeHeading(block.content, 'h3')); break;
      case 'quote':    nodes.push(makeQuote(block.content)); break;
      case 'code':     nodes.push(makeCode(block.content)); break;
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

function extractText(children: any[]): string {
  if (!children) return '';
  return children.map(c => {
    if (c.type === 'link') {
      const linkText = c.children?.map((lc: any) => lc.text || '').join('') || '';
      return `[${linkText}](${c.fields?.url || ''})`;
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
    const text = extractText((node.children as any[]) || []);

    if (node.type === 'heading') {
      const tagMap: Record<string, BlockType> = { h1: 'heading1', h2: 'heading2', h3: 'heading3' };
      blocks.push({ id: uid(), type: tagMap[node.tag as string] || 'heading1', content: text });
    } else if (node.type === 'quote') {
      blocks.push({ id: uid(), type: 'quote', content: text });
    } else if (node.type === 'code') {
      blocks.push({ id: uid(), type: 'code', content: text });
    } else if (node.type === 'horizontalrule') {
      blocks.push({ id: uid(), type: 'divider', content: '' });
    } else if (node.type === 'list') {
      const listType: BlockType = node.listType === 'bullet' ? 'bulletList' : 'numberedList';
      for (const item of (node.children as Record<string, unknown>[]) || []) {
        const itemText = extractText((item.children as any[]) || []);
        blocks.push({ id: uid(), type: listType, content: itemText });
      }
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
      }
    } else if (node.type === 'upload' && node.relationTo === 'media') {
      const mediaDoc = node.value as any;
      blocks.push({ id: uid(), type: 'image', content: '', data: { image: mediaDoc } });
    } else {
      blocks.push({ id: uid(), type: 'paragraph', content: text });
    }
  }

  return blocks.length ? blocks : [{ id: uid(), type: 'paragraph', content: '' }];
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
