"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Mic, Paperclip, Loader2, ArrowLeft, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  media?: string; // base64 preview for UI
}

export default function WebChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liveContext, setLiveContext] = useState<string[]>([]);

  // Fetch live context periodically
  useEffect(() => {
    const fetchContext = () => {
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data && data.network) {
            setLiveContext(data.network.slice(0, 8)); // Show top 8 recent entities
          }
        })
        .catch(() => {});
    };
    
    fetchContext(); // initial
    const interval = setInterval(fetchContext, 5000); // every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    let base64Data = null;
    let mimeType = null;
    let uiPreview = preview;

    if (selectedFile) {
      mimeType = selectedFile.type;
      base64Data = preview?.split(',')[1]; // remove data:image/png;base64,
    }

    const newMessage: Message = { 
      role: "user", 
      content: input || "Uploaded a file.",
      media: uiPreview || undefined
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSelectedFile(null);
    setPreview(null);
    setLoading(true);

    try {
      const payload: any = {
        message: newMessage.content,
        history: []
      };

      if (base64Data && mimeType) {
        payload.mediaFiles = [{ mimeType, base64Data }];
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "No response." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Failed to connect to Nexus API." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full font-sans relative overflow-hidden">
      <div className="flex flex-col flex-1 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 glass-panel">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Nexus Chat <span className="flex h-2 w-2 rounded-full bg-blue-500 neon-glow animate-pulse"></span>
            </h1>
          </div>
          <Link href="/dashboard">
            <button className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              View Dashboard
            </button>
          </Link>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-32"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-900/30 neon-glow mb-6">
                  <BrainCircuit className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">How can I help you today?</h2>
                <p className="text-gray-400 text-lg">Upload a business card, record a memo, or just brain dump.</p>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-5 rounded-2xl ${
                    m.role === 'user' 
                      ? 'bg-blue-600/90 text-white rounded-br-none shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                      : 'glass-card text-gray-200 rounded-bl-none'
                  }`}>
                    {m.media && (
                      <div className="mb-4">
                        {m.media.startsWith('data:image') ? (
                          <img src={m.media} alt="upload" className="max-w-full rounded-xl max-h-72 object-cover border border-white/10" />
                        ) : (
                          <div className="flex items-center gap-2 text-sm bg-black/40 p-3 rounded-lg border border-white/5">
                            <Paperclip className="w-4 h-4 text-blue-400" /> Audio/File Attached
                          </div>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="glass-card p-5 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-gray-400 text-sm">Nexus is thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 glass-panel relative z-20">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {preview && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mb-4 relative inline-block"
                >
                  {preview.startsWith('data:image') ? (
                    <img src={preview} alt="preview" className="h-24 rounded-xl border border-white/20 shadow-lg" />
                  ) : (
                    <div className="h-12 px-5 bg-black/50 rounded-xl flex items-center gap-3 text-sm text-gray-300 border border-white/10">
                      <Paperclip className="w-4 h-4 text-blue-400" /> File selected
                    </div>
                  )}
                  <button 
                    onClick={() => { setSelectedFile(null); setPreview(null); }}
                    className="absolute -top-3 -right-3 bg-red-500/90 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg transition-colors backdrop-blur-md"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-3 glass-card rounded-2xl p-2 focus-within:border-blue-500/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-blue-400 transition-colors rounded-xl hover:bg-white/5"
                title="Upload File"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,audio/*"
              />
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message Nexus..."
                className="flex-1 bg-transparent text-white border-none focus:outline-none resize-none max-h-32 py-3 placeholder:text-gray-500"
                rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 5) : 1}
              />

              <button 
                onClick={handleSend}
                disabled={loading || (!input.trim() && !selectedFile)}
                className="p-3 bg-blue-600/90 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-30 disabled:hover:bg-blue-600/90 shadow-lg disabled:shadow-none mb-1 mr-1"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-2">
              <BrainCircuit className="w-3 h-3" /> Nexus processes inputs natively using Vertex AI Gemini
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side Context Panel (The 10x "Brain" visual) */}
      <div className="hidden lg:block w-80 border-l border-white/5 glass-panel p-6 overflow-y-auto relative z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-500/20 rounded-lg neon-glow">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-sm font-bold text-gray-300 tracking-widest uppercase">Live Context</h2>
        </div>
        
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">Entities currently loaded in Valkey working memory.</p>
        
        <div className="space-y-3">
          <AnimatePresence>
            {liveContext.length > 0 ? (
              liveContext.map((entity, idx) => (
                <motion.div 
                  key={`${entity}-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-3 glass-card rounded-xl text-sm text-gray-200 flex items-center gap-3 hover:bg-white/5 transition-colors border-white/5"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80] animate-pulse"></div>
                  {entity}
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-500 italic p-4 glass-card rounded-xl text-center"
              >
                Graph is silent.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
