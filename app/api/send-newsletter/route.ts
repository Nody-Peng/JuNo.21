import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import nodemailer from 'nodemailer';
import { cookies } from 'next/headers';

// Gmail transporter
const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Beautiful HTML email template
function buildEmailHtml(subject: string, htmlContent: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #F9F8F6; font-family: Georgia, 'Noto Serif TC', serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header {
      background: #3B2D2A;
      border-radius: 12px 12px 0 0;
      padding: 32px 40px;
      text-align: center;
    }
    .header-logo {
      font-size: 1.6rem;
      color: #F9F8F6;
      letter-spacing: 0.2em;
      font-weight: bold;
    }
    .header-sub {
      color: rgba(249,248,246,0.6);
      font-size: 0.8rem;
      letter-spacing: 0.15em;
      margin-top: 6px;
    }
    .body {
      background: #ffffff;
      padding: 40px;
      border-left: 1px solid #E8E4E0;
      border-right: 1px solid #E8E4E0;
    }
    .body h2 {
      font-size: 1.5rem;
      color: #2C2422;
      margin-bottom: 24px;
      line-height: 1.4;
      border-bottom: 2px solid #E8F3E8;
      padding-bottom: 16px;
    }
    .body p {
      color: #4A3B38;
      line-height: 1.9;
      margin-bottom: 16px;
      font-size: 1rem;
    }
    .body img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
    .divider { height: 1px; background: #E8E4E0; margin: 32px 0; }
    .footer {
      background: #F0EDE9;
      border-radius: 0 0 12px 12px;
      padding: 28px 40px;
      text-align: center;
      border-left: 1px solid #E8E4E0;
      border-right: 1px solid #E8E4E0;
      border-bottom: 1px solid #E8E4E0;
    }
    .footer p {
      color: #8A7A77;
      font-size: 0.8rem;
      line-height: 1.8;
      margin: 0;
    }
    .footer a {
      color: #6B5B57;
      text-decoration: underline;
    }
    .unsubscribe {
      margin-top: 12px;
      font-size: 0.75rem;
      color: #B0A09D;
    }
    .unsubscribe a { color: #B0A09D; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">夏至原點</div>
      <div class="header-sub">跨越時差的日常</div>
    </div>
    <div class="body">
      <h2>${subject}</h2>
      ${htmlContent}
      <div class="divider"></div>
    </div>
    <div class="footer">
      <p>感謝你訂閱《夏至原點》電子報 ✨<br/>這封信是由 <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}">夏至原點</a> 寄出</p>
      <p class="unsubscribe">不想再收到電子報？<a href="${unsubscribeUrl}">點此退訂</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication via Payload cookie
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get('payload-token');
    if (!payloadToken) {
      return NextResponse.json({ error: '未授權，請先登入後台' }, { status: 401 });
    }

    const { subject, htmlContent } = await req.json();
    if (!subject || !htmlContent) {
      return NextResponse.json({ error: '請填寫主旨和內容' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Fetch all active subscribers
    const { docs: subscribers } = await payload.find({
      collection: 'subscribers',
      where: { isActive: { equals: true } },
      limit: 10000,
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ message: '目前沒有活躍的訂閱者', sent: 0 }, { status: 200 });
    }

    const transporter = createTransporter();
    let sent = 0;
    let failed = 0;

    // Send individual emails (to protect subscriber privacy)
    for (const sub of subscribers) {
      const subscriber = sub as any;
      const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${subscriber.unsubscribeToken}`;
      const emailHtml = buildEmailHtml(subject, htmlContent, unsubscribeUrl);

      try {
        await transporter.sendMail({
          from: `"夏至原點" <${process.env.GMAIL_USER}>`,
          to: subscriber.email,
          subject,
          html: emailHtml,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      message: `發送完成！成功 ${sent} 封，失敗 ${failed} 封`,
      sent,
      failed,
    });
  } catch (error: any) {
    console.error('Send newsletter error:', error);
    return NextResponse.json({ error: `發送失敗：${error.message}` }, { status: 500 });
  }
}

// GET: return subscriber count (for admin UI)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const payloadToken = cookieStore.get('payload-token');
    if (!payloadToken) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const payload = await getPayload({ config: configPromise });
    const { totalDocs } = await payload.find({
      collection: 'subscribers',
      where: { isActive: { equals: true } },
      limit: 0,
    });

    return NextResponse.json({ count: totalDocs });
  } catch (error) {
    return NextResponse.json({ error: '無法取得訂閱人數' }, { status: 500 });
  }
}
