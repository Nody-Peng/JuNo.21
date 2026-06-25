import { NextResponse } from 'next/server';
// @ts-ignore
import { Client } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URI) {
    return NextResponse.json({ success: false, error: 'No DATABASE_URI found' }, { status: 500 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(`ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'draft';`);
    await client.end();
    
    return NextResponse.json({ success: true, message: 'Database migrated successfully!' });
  } catch (error: any) {
    try { await client.end(); } catch (e) {}
    return NextResponse.json({ success: false, error: error.message || error.toString() }, { status: 500 });
  }
}
