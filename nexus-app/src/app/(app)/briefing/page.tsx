"use client";

import { useEffect, useState } from "react";
import { Sunrise, Loader2, Sparkles } from "lucide-react";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/briefing')
      .then(res => res.json())
      .then(data => {
        setBriefing(data.briefing);
        setLoading(false);
      })
      .catch(err => {
        setBriefing("Failed to generate briefing. Ensure Vertex AI is configured.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto text-gray-200 p-8 font-sans bg-gradient-to-br from-[#0a0a0a] to-[#111827]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-500 flex items-center gap-3">
              <Sunrise className="w-10 h-10 text-orange-400" />
              Nexus Daily Briefing
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Your proactive morning intelligence report.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Vertex AI Generated</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-6" />
            <p className="text-xl font-medium text-gray-300">Compiling your morning briefing...</p>
            <p className="text-gray-500 mt-2">Analyzing your Valkey network graph and recent conversations.</p>
          </div>
        ) : (
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-3xl p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-orange-400 prose-a:text-blue-400 leading-relaxed relative z-10 whitespace-pre-wrap">
              {briefing}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
