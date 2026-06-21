'use client';

import { Users, Activity, Network } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NetworkDashboard() {
  const [connections, setConnections] = useState<string[]>([]);
  
  // Quick poll to refresh network data from our mock endpoint
  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await fetch('/api/network');
        const data = await res.json();
        setConnections(data.connections || []);
      } catch (err) {
        // ignore
      }
    };
    fetchNetwork();
    const interval = setInterval(fetchNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Network className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100">Your Network Graph</h2>
          <p className="text-xs text-slate-400">Context stored in Valkey</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Nodes</span>
          </div>
          <div className="text-3xl font-bold text-slate-100">{connections.length}</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Memory Status</span>
          </div>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Extracted Connections</h3>
        {connections.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
            No connections found.<br/> Tell Nexus who you met today!
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn, idx) => (
              <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-sm text-slate-200">
                {conn}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
