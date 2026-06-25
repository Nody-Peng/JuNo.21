'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function loginAction(email: string, password: string) {
  try {
    const res = await fetch(`${SITE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      return { success: false, error: data.errors?.[0]?.message || '帳號或密碼錯誤' };
    }

    const cookieStore = await cookies();

    // Calculate maxAge from Payload's exp or default to 2 hours
    const exp = data.exp ? data.exp : Math.floor(Date.now() / 1000) + 2 * 60 * 60;
    const maxAge = exp - Math.floor(Date.now() / 1000);
    const validMaxAge = maxAge > 0 ? maxAge : 60 * 60 * 2;

    // Secure httpOnly cookie for the JWT token
    cookieStore.set('payload-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validMaxAge,
      path: '/',
    });

    // Non-httpOnly cookie for display info
    cookieStore.set('writer-user', JSON.stringify({
      id: data.user.id,
      email: data.user.email,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validMaxAge,
      path: '/',
    });

    return { success: true, user: data.user };
  } catch {
    return { success: false, error: '連線失敗，請稍後再試' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('payload-token');
  cookieStore.delete('writer-token'); // Clear legacy token
  cookieStore.delete('writer-user');
  redirect('/');
}

export async function getServerAuth(): Promise<{ token: string; user: { id: number; email: string } } | null> {
  try {
    const cookieStore = await cookies();
    // Support both new and legacy token names for smooth transition
    const token = cookieStore.get('payload-token')?.value || cookieStore.get('writer-token')?.value;
    const userStr = cookieStore.get('writer-user')?.value;

    if (!token || !userStr) return null;

    // Check JWT expiration
    const parts = token.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          return null; // Token expired
        }
      } catch (e) {
        // Ignore parse error
      }
    }

    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}
