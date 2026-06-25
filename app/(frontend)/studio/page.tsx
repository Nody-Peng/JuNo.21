import { getServerAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export default async function StudioPage() {
  const auth = await getServerAuth();
  if (auth) {
    redirect('/my-posts');
  }
  return <LoginClient />;
}
