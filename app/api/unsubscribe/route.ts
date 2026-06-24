import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return new NextResponse(unsubscribePage('缺少退訂參數', false), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 400,
      });
    }

    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: 'subscribers',
      where: { unsubscribeToken: { equals: token } },
    });

    if (result.docs.length === 0) {
      return new NextResponse(unsubscribePage('找不到對應的訂閱記錄', false), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 404,
      });
    }

    const subscriber = result.docs[0] as any;
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      data: { isActive: false },
    });

    return new NextResponse(unsubscribePage(subscriber.email, true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 200,
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(unsubscribePage('發生錯誤，請稍後再試', false), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 500,
    });
  }
}

function unsubscribePage(emailOrMsg: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${success ? '退訂成功' : '退訂失敗'} — 夏至原點</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Serif TC', Georgia, serif;
      background: #F9F8F6;
      color: #3B2D2A;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: white;
      border-radius: 12px;
      padding: 3rem 2.5rem;
      text-align: center;
      box-shadow: 0 4px 40px rgba(59,45,42,0.08);
    }
    .icon { font-size: 3rem; margin-bottom: 1.5rem; }
    h1 { font-size: 1.8rem; margin-bottom: 1rem; }
    p { color: #6B5B57; line-height: 1.8; margin-bottom: 1.5rem; }
    a {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: #3B2D2A;
      color: white;
      border-radius: 999px;
      text-decoration: none;
      font-size: 0.9rem;
      letter-spacing: 0.1em;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '🌿' : '⚠️'}</div>
    <h1>${success ? '退訂成功' : '退訂失敗'}</h1>
    <p>
      ${success
        ? `<strong>${emailOrMsg}</strong><br/>你已成功取消訂閱《夏至原點》電子報。<br/>如果日後想重新訂閱，隨時歡迎你回來。`
        : emailOrMsg
      }
    </p>
    <a href="/">回到夏至原點</a>
  </div>
</body>
</html>`;
}
