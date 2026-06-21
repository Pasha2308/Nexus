import { NextResponse } from 'next/server';
import valkey from '@/lib/valkey';

export async function GET() {
  try {
    // Fetch last 50 memories (session_memory)
    const rawMemories = await valkey.lrange('session_memory', 0, 50);
    const memories = rawMemories.map(m => {
      try {
        return JSON.parse(m);
      } catch (e) {
        return { role: 'unknown', content: m };
      }
    });

    // Fetch all network connections (set)
    const networkConnections = await valkey.smembers('network_connections');

    return NextResponse.json({
      memories,
      network: networkConnections,
      stats: {
        totalMemories: memories.length,
        totalConnections: networkConnections.length
      }
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
