import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/auth';
import { getCategories } from '@/lib/api';
import WriteClient from './WriteClient';

export const metadata = { title: '寫文章 · 夏至原點' };

export default async function WritePage() {
  const auth = await getServerAuth();
  if (!auth) redirect('/studio');

  const categories = await getCategories();

  return (
    <WriteClient
      token={auth.token}
      userId={auth.user.id}
      categories={categories}
    />
  );
}
