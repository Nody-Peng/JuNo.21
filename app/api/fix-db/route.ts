import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // We can execute raw SQL using drizzle
    // @ts-ignore
    const db = payload.db.drizzle;
    
    if (!db) {
      return NextResponse.json({ success: false, error: 'No drizzle db found' }, { status: 500 });
    }

    await db.execute(sql`ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'draft';`);
    
    return NextResponse.json({ success: true, message: 'Database migrated successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || error.toString() }, { status: 500 });
  }
}
