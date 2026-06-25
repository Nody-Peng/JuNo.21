const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  return SITE_URL;
};

export interface Category {
  id: string;
  title: string;
}

export interface MediaDoc {
  id: string;
  url: string;
  alt: string;
}

export interface PostDoc {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedDate: string;
  status?: string;
  series?: string;
  heroImage?: MediaDoc;
  category?: Category[];
  content?: unknown;
}

// ─── Categories ──────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/categories?limit=100`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.docs || [];
  } catch {
    return [];
  }
}

// ─── Posts ───────────────────────────────────────────────────
export async function createPost(token: string, postData: Record<string, unknown>) {
  const res = await fetch(`${getBaseUrl()}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(postData),
  });
  const data = await res.json();
  return data.doc || data;
}

export async function updatePost(token: string, id: string, postData: Record<string, unknown>) {
  const res = await fetch(`${getBaseUrl()}/api/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(postData),
  });
  const data = await res.json();
  return data.doc || data;
}

export async function getMyPosts(token: string, userId: number): Promise<{ docs: PostDoc[] }> {
  try {
    const res = await fetch(
      `${getBaseUrl()}/api/posts?where[author][equals]=${userId}&limit=100&sort=-publishedDate`,
      {
        headers: { Authorization: `JWT ${token}` },
        cache: 'no-store',
      },
    );
    return res.json();
  } catch {
    return { docs: [] };
  }
}

export async function getPostById(token: string, id: string) {
  const res = await fetch(`${getBaseUrl()}/api/posts/${id}`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  });
  return res.json();
}

// ─── Media ───────────────────────────────────────────────────
export async function uploadMedia(token: string, file: File, alt: string): Promise<MediaDoc> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('_payload', JSON.stringify({ alt: alt || file.name }));

  const res = await fetch(`${getBaseUrl()}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  });
  const data = await res.json();
  return data.doc || data;
}
