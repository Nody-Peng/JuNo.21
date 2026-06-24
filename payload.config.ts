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
  labels: { singular: 'Ë≥™Ê??∏Áâ©?°Á? (Product Showcase)', plural: '?∏Áâ©?°Á? (Products)' },
  fields: [
    {
      name: 'productName',
      type: 'text',
      required: true,
      label: '?ÜÂ??çÁ®±',
    },
    {
      name: 'price',
      type: 'text',
      label: '?πÊ†º?ñÂ??ÉÂîÆ??(‰æãÂ?ÔºöNT$ 1,200)',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: '?®Ëñ¶?ÜÁî± / ?ÜÂ??èËø∞',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Ë≥ºË≤∑?ñ‰?Á¥πÈÄ?? (URL)',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: '?ÜÂ??ñÁ? (Âª∫Ë≠∞?ªË??ñÊ≠£?πÂΩ¢)',
    },
  ],
};

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Â§èËá≥?üÈ?',
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
        group: 'Á≥ªÁµ±Ë®≠Â?',
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
        group: '?ßÂÆπÁÆ°Á?',
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
        group: 'Â™íÈ?Ë≥áÊ?',
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
          label: '?ø‰ª£?áÂ? (SEO ??',
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
        group: '?ßÂÆπÁÆ°Á?',
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
            description: '‰∏äÂÇ≥Ê≠§Ê?Á´†Á?Â∞ÅÈù¢?ñÁ?',
          },
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            position: 'sidebar',
            description: 'Â∞áÊ≠§?áÁ?Ë®≠ÁÇ∫ÁΩÆÈ?/Á≤æÈÅ∏?áÁ?',
          },
        },
        {
          name: 'series',
          type: 'text',
          admin: {
            position: 'sidebar',
            description: '?•ÁÇ∫????áÁ?(Â¶??óÁ?Á¥Ä??ÔºåË?Â°´ÂØ´Á≥ªÂ??çÁ®±',
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
        group: '?ªÂ???,
        description: 'ÁÆ°Á??Ä?âÈõªÂ≠êÂ†±Ë®ÇÈñ±?Ö„ÄÇÂ?Ê∂àÂãæ?∏„ÄåÂ??®„ÄçÂç≥?ØÂ?Ê≠¢Â?Ë©≤Áî®?∂Áôº?Å‰ø°‰ª∂„Ä?,
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
          label: 'Ë®ÇÈñ±?ÇÈ?',
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
          label: '?ÄË®?Token',
          admin: {
            readOnly: true,
            description: 'Á≥ªÁµ±?™Â??¢Á?ÔºåÁî®?ºÈÄÄË®ÇÈÄ??',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          label: '?üÁî®ÔºàÂ?Ê∂àÂãæ?∏Âç≥?úÊ≠¢?º‰ø°Ôº?,
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
        group: 'Á≥ªÁµ±Ë®≠Â?',
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
  
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
  
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
