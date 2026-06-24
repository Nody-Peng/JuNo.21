import { buildConfig, Block } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
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
  labels: { singular: '質感選物卡片 (Product Showcase)', plural: '選物卡片 (Products)' },
  fields: [
    {
      name: 'productName',
      type: 'text',
      required: true,
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
      required: true,
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
      required: true,
      label: '商品圖片 (建議去背或正方形)',
    },
  ],
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
    }
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
        {
          name: 'slug',
          type: 'text',
          unique: true,
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
            description: '上傳此文章的封面圖片',
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
              BlocksFeature({
                blocks: [MapBlock, VideoBlock, ProductBlock],
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
  }),
  
  plugins: (() => {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    // Only initialize if token matches the required format: vercel_blob_rw_<storeId>_<random>
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