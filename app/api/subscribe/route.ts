import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '請輸入有效的 Email 地址' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // Check if already subscribed
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email.toLowerCase().trim() } },
    });

    if (existing.docs.length > 0) {
      const sub = existing.docs[0] as any;
      if (sub.isActive) {
        return NextResponse.json({ message: '你已經是訂閱者了！感謝你的支持 ❤️' }, { status: 200 });
      } else {
        // Re-activate
        await payload.update({
          collection: 'subscribers',
          id: sub.id,
          data: { isActive: true },
        });
        return NextResponse.json({ message: '歡迎回來！你已重新加入電子報訂閱 ✨' }, { status: 200 });
      }
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    await payload.create({
      collection: 'subscribers',
      data: {
        email: email.toLowerCase().trim(),
        subscribedAt: new Date().toISOString(),
        unsubscribeToken,
        isActive: true,
      },
    });

    return NextResponse.json({ message: '訂閱成功！期待與你在信箱相見 🌿' }, { status: 201 });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: '訂閱失敗，請稍後再試' }, { status: 500 });
  }
}
