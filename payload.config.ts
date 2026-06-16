import { buildConfig, Block } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';
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
      ]
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
                blocks: [MapBlock, VideoBlock],
              }),
            ],
          }),
          required: true,
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
  
  secret: process.env.PAYLOAD_SECRET || '',
});