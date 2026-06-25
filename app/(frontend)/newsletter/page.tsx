import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/auth';
import NewsletterClient from './NewsletterClient';

export const metadata = { title: '發送電子報 · 夏至原點' };

export default async function NewsletterPage() {
  const auth = await getServerAuth();
  if (!auth) redirect('/studio');

  return <NewsletterClient />;
}
