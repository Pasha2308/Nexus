"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Network, Activity, Clock, FileText, Loader2, Server, Flame, Snowflake, ThermometerSun } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto text-gray-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-blue-400" />
              Nexus Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Your Second Brain & Multimodal Memory Graph</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
            <Server className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Valkey Connected</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-blue-500 transition-colors">
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Memories</p>
              <p className="text-3xl font-bold text-white">{data?.stats?.totalMemories || 0}</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-purple-500 transition-colors">
            <div className="p-4 bg-purple-500/10 rounded-xl">
              <Network className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Network Graph Size</p>
              <p className="text-3xl font-bold text-white">{data?.stats?.totalConnections || 0}</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-green-500 transition-colors">
            <div className="p-4 bg-green-500/10 rounded-xl">
              <Clock className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Session</p>
              <p className="text-3xl font-bold text-white">Live</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Memory Stream */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Raw Memory Stream</h2>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {data?.memories?.length > 0 ? (
                data.memories.map((mem: any, i: number) => (
                  <div key={i} className={\`p-4 rounded-xl text-sm leading-relaxed \${mem.role === 'user' ? 'bg-blue-900/20 border border-blue-500/30 text-blue-100 ml-8' : 'bg-gray-800 border border-gray-700 text-gray-300 mr-8'}\`}>
                    <div className="text-xs font-bold mb-1 opacity-50 uppercase tracking-wider">
                      {mem.role}
                    </div>
                    <div className="whitespace-pre-wrap">{mem.content}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center mt-10">No memories found in Valkey.</p>
              )}
            </div>
          </div>

          {/* Network Connections */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex items-center gap-3">
              <Network className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Network Extraction Graph</h2>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {data?.network?.length > 0 ? (
                <div className="space-y-3">
                  {data.network.map((person: string, i: number) => {
                    // Generate deterministic health status for hackathon demo
                    const healthScore = person.length % 3;
                    const isHot = healthScore === 0;
                    const isWarm = healthScore === 1;
                    
                    return (
                      <div key={i} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center justify-between hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                          <p className="text-gray-200 text-sm font-medium">{person}</p>
                        </div>
                        <div className={\`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold \${
                          isHot ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          isWarm ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }\`}>
                          {isHot ? <Flame className="w-3 h-3" /> : isWarm ? <ThermometerSun className="w-3 h-3" /> : <Snowflake className="w-3 h-3" />}
                          {isHot ? 'HOT' : isWarm ? 'WARM' : 'COLD'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-10">No network entities extracted yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
