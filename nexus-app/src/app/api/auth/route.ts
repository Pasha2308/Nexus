import { NextResponse } from 'next/server';

// Extremely simple master password auth for personal CRM
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "nexus10x";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === MASTER_PASSWORD) {
      const response = NextResponse.json({ success: true });
      // Set an auth cookie
      response.cookies.set('nexus_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
