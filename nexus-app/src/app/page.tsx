import ChatInterface from '@/components/chat-interface';
import NetworkDashboard from '@/components/network-dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6">
        
        {/* Left Side - Network Dashboard */}
        <div className="w-full md:w-1/3 h-full">
          <NetworkDashboard />
        </div>

        {/* Right Side - Chat Interface */}
        <div className="w-full md:w-2/3 h-full">
          <ChatInterface />
        </div>

      </div>
    </main>
  );
}
