import { NextResponse } from 'next/server';
import valkey from '@/lib/valkey';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connections = await valkey.smembers('network_connections');
    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Network API Error:", error);
    return NextResponse.json({ connections: [] }, { status: 500 });
  }
}
