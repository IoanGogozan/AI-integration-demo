import { NextResponse } from 'next/server';
import { clearAppSessionCookie } from '../../../../lib/auth';

export async function POST() {
  await clearAppSessionCookie();
  return new NextResponse(null, {
    status: 204
  });
}
