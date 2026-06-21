"use client";

import { useState } from "react";
import { Search, Loader2, BrainCircuit } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults("");

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      setResults(data.reply);
    } catch (err) {
      setResults("Failed to search. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto text-gray-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
            <Search className="w-10 h-10 text-blue-400" />
            Semantic Memory Search
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Query your Valkey Network Graph using natural language.</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <BrainCircuit className="w-6 h-6 text-blue-500/50" />
          </div>
          <input 
            type="text" 
            placeholder="e.g. 'Who was that investor I met who liked tennis?'" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white text-lg rounded-2xl py-6 pl-14 pr-32 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-3 top-3 bottom-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </button>
        </form>

        {/* Results Area */}
        {loading && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400">Vertex AI is scanning your Valkey Graph...</p>
          </div>
        )}

        {!loading && results && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" /> Nexus Result
            </h3>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
              {results}
            </div>
          </div>
        )}

        {!loading && !results && (
          <div className="bg-gray-900/20 border border-gray-800/50 rounded-2xl p-8 text-center">
             <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
             <p className="text-gray-500">Your search results will appear here.</p>
          </div>
        )}

      </div>
    </div>
  );
}
