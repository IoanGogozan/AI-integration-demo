import { NextResponse } from 'next/server';
import { authenticateWebDemoUser, setAppSessionCookie } from '../../../../lib/auth';

export async function POST(request) {
  const body = await request.json();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const user = authenticateWebDemoUser(email, password);

  if (!user) {
    return NextResponse.json(
      {
        message: 'Invalid credentials'
      },
      {
        status: 401
      }
    );
  }

  await setAppSessionCookie(user);

  const { password: _password, ...safeUser } = user;

  return NextResponse.json(
    {
      user: safeUser
    },
    {
      status: 201
    }
  );
}
