# AI Development Guide: Custom Blocks for JuNo.21

This document is specifically designed as context for AI assistants (like ChatGPT, Claude, Gemini) to help the site owner add new features to this project. 
**If you are an AI reading this, please read the architectural context carefully before generating code.**

## Architectural Overview

This project uses **Next.js (App Router)** and **Payload CMS 3.x**. 
Instead of relying entirely on the Payload Admin panel for writing blog posts, this project features a **Custom Frontend Block Editor** located at `/app/(frontend)/write/WriteClient.tsx` and `EditClient.tsx`.

### The "Bridge": Custom Block Editor <-> Payload Lexical

The Payload backend uses the `lexical` rich text editor. However, the custom frontend editor uses its own simple, state-based array of blocks (e.g., `{ id, type, content, data }`).
To bridge these two completely different structures, we use the `lib/blocks-to-lexical.ts` utility.

When a post is saved from the frontend, `blocksToLexical` converts the simple frontend array into a complex Payload Lexical JSON AST.
When a post is fetched from Payload to be edited, `lexicalToBlocks` parses the Payload Lexical JSON AST back into the simple frontend array.

## How to Add a New Custom Block

If you are asked to add a new custom block (e.g., a "Flashcard", "Info Callout", "FAQ Accordion", etc.), you **MUST** follow these 4 steps across the stack:

### Step 1: Define the Block Schema in Payload (Backend)
Modify `payload.config.ts`.
1. Find the area where custom blocks are defined (e.g., `ProductBlock`, `TableBlock`).
2. Create a new `Block` object defining the schema for your new block.
3. **CRITICAL**: If your block includes an `image` (upload field), set `relationTo: 'media'`. Note: To allow saving partial drafts from the frontend without validation crashes, **DO NOT** use `required: true` on fields inside your custom block unless strictly necessary.
4. Add your new block to the `blocks` array inside the Lexical `lexicalEditor({ features: [ BlocksFeature({ blocks: [ ... ] }) ] })` definition within the `posts` collection schema in `payload.config.ts`.

### Step 2: Update the Conversion Logic (`lib/blocks-to-lexical.ts`)
This is the most critical step to prevent data loss.
1. **Frontend -> Backend (`blocksToLexical`)**: 
   Inside the `switch (block.type)` statement, add a case for your new block type. Map the frontend `block.data` to match the exact schema you defined in Step 1.
   *Format example:*
   ```typescript
   case 'yourNewBlock':
     nodes.push({ 
       type: 'block', 
       fields: { blockType: 'yourNewBlock', ...(block.data || {}) }, 
       format: '', version: 2 
     });
     break;
   ```
2. **Backend -> Frontend (`lexicalToBlocks`)**:
   Inside the `else if (node.type === 'block')` block, add a condition to extract your block from Lexical and push it to the frontend format.
   *Format example:*
   ```typescript
   else if (fields?.blockType === 'yourNewBlock') {
     blocks.push({ id: uid(), type: 'yourNewBlock', content: '', data: fields });
   }
   ```

### Step 3: Build the UI in the Frontend Editor (`components/writer/BlockEditor.tsx`)
1. In `BlockEditor.tsx`, locate the `block.type === 'product'` (or similar) ternary rendering block inside the map function.
2. Add your new block type to the UI rendering logic.
3. Use simple `input` or `textarea` elements.
4. Bind their values to `block.data.YOUR_FIELD` and update state using:
   ```typescript
   updateBlock(block.id, { data: { ...block.data, YOUR_FIELD: e.target.value } });
   ```
5. **IMPORTANT (For Image Uploads)**: If your block uses image uploads, use the `onUploadImage` prop passed into `BlockEditor`. It returns `{ id, url }`. Store this object in your `block.data` so that `blocks-to-lexical.ts` can extract the `id` for Payload's `upload` relation field.

### Step 4: Render the Block in the Post View (`app/(frontend)/post/[slug]/page.tsx`)
1. In the dynamic route for rendering the post, we map over the Payload Lexical AST directly.
2. Locate the `renderLexicalNode` function (or similar rendering loop).
3. In the section handling `node.type === 'block'`, add a check for `node.fields.blockType === 'yourNewBlock'`.
4. Render the beautiful, read-only HTML/Tailwind version of your block using the data from `node.fields`.

## Critical Tips for AI

- **Do NOT** try to mutate Payload's database directly using Prisma/SQL. Payload manages its own MongoDB/PostgreSQL schema via the config.
- **Images in Custom Blocks**: Payload's `upload` field expects an `id` (string/number) of the related Media document when saving. If the frontend passes a full object `{url: '...', alt: '...'}`, ensure `blocksToLexical.ts` strips it down to JUST the `id` before sending it to the backend, otherwise Payload's validation will reject the save.
- **DOM Syncing in Block Editor**: The custom `BlockEditor` uses a mix of React state and direct DOM ref manipulation (`textareaRefs`) for cursor handling (Arrow Up/Down). When adding basic blocks (paragraphs, quotes), be aware of the `handleKeyDown` logic. For complex structured blocks (like products or your new custom block), ensure you include a hidden textarea or manage focus manually so the user's keyboard navigation (Arrow Up/Down) doesn't break when passing through your block.
