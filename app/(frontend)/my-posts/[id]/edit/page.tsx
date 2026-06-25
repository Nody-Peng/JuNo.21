import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/auth';
import { getCategories, getPostById } from '@/lib/api';
import EditClient from './EditClient';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getServerAuth();
  if (!auth) redirect('/studio');

  const [post, categories] = await Promise.all([
    getPostById(auth.token, id),
    getCategories(),
  ]);

  if (!post || post.errors) redirect('/my-posts');

  return (
    <EditClient
      token={auth.token}
      userId={auth.user.id}
      categories={categories}
      post={post}
    />
  );
}
