import { buildConfig, Block } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor, BlocksFeature, InlineToolbarFeature } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { FieldHook } from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const MapBlock: Block = {
  slug: 'map',
  labels: { singular: 'Map', plural: 'Maps' },
  fields: [
    {
      name: 'embedHtml',
      type: 'textarea',
      required: true,
      label: 'Google Maps Embed HTML (<iframe>...)',
    },
  ],
};

const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'YouTube or Vimeo URL',
    },
  ],
};

const ProductBlock: Block = {
  slug: 'product',
  labels: { singular: '質感選物選品集 (Products Carousel)', plural: '選物選品集 (Products)' },
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      label: '推薦區塊標題 (例如：虎航登機箱推薦)',
    },
    {
      name: 'items',
      type: 'array',
      label: '商品列表',
      minRows: 1,
      fields: [
        {
          name: 'productName',
          type: 'text',
          label: '商品名稱',
        },
        {
          name: 'price',
          type: 'text',
          label: '價格或參考售價 (例如：NT$ 1,200)',
        },
        {
          name: 'description',
          type: 'textarea',
          label: '推薦理由 / 商品描述',
        },
        {
          name: 'link',
          type: 'text',
          label: '購買或介紹連結 (URL)',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: '商品圖片',
          admin: {
            description: '建議上傳去背或正方形圖片 (建議長寬比 1:1，例如 600x600)',
          },
        },
      ],
    }
  ],
};

const TableBlock: Block = {
  slug: 'table',
  labels: { singular: '表格 (Table)', plural: '表格 (Tables)' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '表格標題 (可選)',
    },
    {
      name: 'header',
      type: 'array',
      label: '表頭 (Header)',
      fields: [
        {
          name: 'text',
          type: 'text',
          label: '文字',
        }
      ]
    },
    {
      name: 'rows',
      type: 'array',
      label: '列 (Rows)',
      fields: [
        {
          name: 'cells',
          type: 'array',
          label: '儲存格 (Cells)',
          fields: [
            {
              name: 'text',
              type: 'textarea',
              label: '文字內容 (支援 Markdown 連結)',
            },
            {
              name: 'imageUrl',
              type: 'text',
              label: '圖片網址 (可選)',
            }
          ]
        }
      ]
    }
  ]
};

const TOCBlock: Block = {
  slug: 'toc',
  labels: { singular: '目錄 (Table of Contents)', plural: '目錄 (Table of Contents)' },
  fields: [
    {
      name: 'placeholder',
      type: 'text',
      defaultValue: '目錄將在此處自動生成',
      admin: {
        description: '這是系統自動生成的目錄佔位符，不需要填寫內容。',
        readOnly: true,
      }
    }
  ]
};

const ButtonBlock: Block = {
  slug: 'button',
  labels: { singular: '按鈕 (Button)', plural: '按鈕 (Button)' },
  fields: [
    {
      name: 'text',
      type: 'text',
      label: '按鈕文字',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      label: '連結網址 (URL)',
      required: true,
    }
  ]
};

const CodeBlock: Block = {
  slug: 'codeBlock',
  labels: { singular: '程式碼 (Code Block)', plural: '程式碼 (Code Blocks)' },
  fields: [
    {
      name: 'language',
      type: 'text',
      label: '語言 (例如: typescript, html, python)',
      defaultValue: 'typescript',
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      label: '程式碼內容',
    }
  ]
};

const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: '提示框 (Callout)', plural: '提示框 (Callouts)' },
  fields: [
    {
      name: 'icon',
      type: 'text',
      label: '圖示 (Emoji)',
      defaultValue: '💡',
      required: true,
    },
    {
      name: 'textHtml',
      type: 'textarea',
      label: '內容 (支援 HTML)',
    },
  ],
};

const ToggleBlock: Block = {
  slug: 'toggle',
  labels: { singular: '折疊列表 (Toggle)', plural: '折疊列表 (Toggles)' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '標題',
    },
    {
      name: 'textHtml',
      type: 'textarea',
      label: '折疊內容 (支援 HTML)',
    },
  ],
};

const formatSlug = (fallback: string): FieldHook => {
  return ({ value, originalDoc, data }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim().toLowerCase().replace(/\s+/g, '-');
    }
    const fallbackData = data?.[fallback] || originalDoc?.[fallback];
    if (fallbackData && typeof fallbackData === 'string') {
      return fallbackData.trim().toLowerCase().replace(/\s+/g, '-');
    }
    return value;
  };
};

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- 夏至原點',
    },
    components: {
      graphics: {
        Logo: '@/components/payload/Logo',
        Icon: '@/components/payload/Icon',
      },
      beforeLogin: [
        '@/components/payload/BeforeLogin'
      ],
      views: {
        sendNewsletter: {
          Component: '@/components/payload/SendNewsletter',
          path: '/send-newsletter',
        },
      },
    },
  },
  
  editor: lexicalEditor({}),
  
  collections: [
    {
      slug: 'users',
      auth: true, 
      admin: {
        group: '系統設定',
      },
      fields: [],
    },
    {
      slug: 'categories',
      access: {
        read: () => true,
      },
      admin: {
        useAsTitle: 'title',
        group: '內容管理',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'media',
      access: {
        read: () => true,
      },
      admin: {
        group: '媒體資源',
      },
      upload: {
        staticDir: 'public/media',
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
          label: '替代文字 (SEO 用)',
        },
      ],
    },
    {
      slug: 'posts',
      access: {
        read: ({ req }) => {
          if (req.user) return true;
          return { status: { equals: 'published' } };
        },
      },
      admin: {
        useAsTitle: 'title',
        group: '內容管理',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          admin: {
            position: 'sidebar',
          },
          hooks: {
            beforeValidate: [formatSlug('title')],
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: '草稿 (Draft)', value: 'draft' },
            { label: '已發布 (Published)', value: 'published' },
          ],
          defaultValue: 'draft',
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            position: 'sidebar',
            description: '上傳此文章的封面圖片 (建議長寬比 16:9，例如 1200x675)',
          },
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            position: 'sidebar',
            description: '將此文章設為置頂/精選文章',
          },
        },
        {
          name: 'series',
          type: 'text',
          admin: {
            position: 'sidebar',
            description: '若為連載文章(如:抗癌紀錄)，請填寫系列名稱',
          },
        },
        {
          name: 'excerpt',
          type: 'textarea',
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'publishedDate',
          type: 'date',
          required: true,
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
        },
        {
          name: 'content',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              InlineToolbarFeature(),
              BlocksFeature({
                blocks: [MapBlock, VideoBlock, ProductBlock, TableBlock, TOCBlock, ButtonBlock, CodeBlock, CalloutBlock, ToggleBlock],
              }),
            ],
          }),
          required: true,
        },
      ],
    },
    {
      slug: 'subscribers',
      admin: {
        useAsTitle: 'email',
        group: '電子報',
        description: '管理所有電子報訂閱者。取消勾選「啟用」即可停止對該用戶發送信件。',
        defaultColumns: ['email', 'subscribedAt', 'isActive'],
      },
      access: {
        read: () => true,
        create: () => true,
        update: ({ req }) => Boolean(req.user),
        delete: ({ req }) => Boolean(req.user),
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
          label: 'Email',
        },
        {
          name: 'subscribedAt',
          type: 'date',
          label: '訂閱時間',
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'unsubscribeToken',
          type: 'text',
          label: '退訂 Token',
          admin: {
            readOnly: true,
            description: '系統自動產生，用於退訂連結',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          label: '啟用（取消勾選即停止發信）',
          defaultValue: true,
          admin: {
            position: 'sidebar',
          },
        },
      ],
    },
  ],

  globals: [
    {
      slug: 'navigation',
      admin: {
        group: '系統設定',
      },
      fields: [
        {
          name: 'navItems',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'link',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
  
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true, // Force push schema changes (like adding _status) to DB in production
  }),
  
  plugins: (() => {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token && /^vercel_blob_rw_[A-Za-z0-9]+_[A-Za-z0-9]+$/.test(token)) {
      return [
        vercelBlobStorage({
          collections: {
            media: true,
          },
          token,
        }),
      ];
    }
    return [];
  })() as any,
  
  cors: [
    'http://localhost:3000', 
    'http://192.168.50.143:3000', 
    process.env.NEXT_PUBLIC_SITE_URL || ''
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000', 
    'http://192.168.50.143:3000', 
    process.env.NEXT_PUBLIC_SITE_URL || ''
  ].filter(Boolean),
  
  secret: process.env.PAYLOAD_SECRET || '',
});