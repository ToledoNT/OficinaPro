import { NextResponse } from 'next/server';
import { removeSessionCookie } from '@/lib/auth';

export async function POST() {
  await removeSessionCookie();
  return NextResponse.json({ success: true });
}
