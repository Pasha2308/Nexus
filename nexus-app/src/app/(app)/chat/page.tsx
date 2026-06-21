"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Mic, Paperclip, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="flex flex-col h-full font-sans relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-wide">Nexus Chat</h1>
        </div>
        <Link href="/dashboard">
          <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">
            View Dashboard
          </button>
        </Link>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <h2 className="text-2xl font-bold text-white mb-2">How can I help you today?</h2>
              <p className="text-gray-500">Upload a business card, record a memo, or just brain dump.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
              <div className={\`max-w-[80%] p-4 rounded-2xl \${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'
              }\`}>
                {m.media && (
                  <div className="mb-3">
                    {m.media.startsWith('data:image') ? (
                      <img src={m.media} alt="upload" className="max-w-full rounded-xl max-h-60 object-cover" />
                    ) : (
                      <div className="flex items-center gap-2 text-sm bg-black/20 p-2 rounded-lg">
                        <Paperclip className="w-4 h-4" /> Audio/File Attached
                      </div>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-800 bg-black/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          {preview && (
            <div className="mb-4 relative inline-block">
              {preview.startsWith('data:image') ? (
                <img src={preview} alt="preview" className="h-20 rounded-lg border border-gray-700" />
              ) : (
                <div className="h-10 px-4 bg-gray-800 rounded-lg flex items-center gap-2 text-sm text-gray-300">
                  <Paperclip className="w-4 h-4" /> File selected
                </div>
              )}
              <button 
                onClick={() => { setSelectedFile(null); setPreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-end gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-2 focus-within:border-blue-500 transition-colors">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-white transition-colors"
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
              className="flex-1 bg-transparent text-white border-none focus:outline-none resize-none max-h-32 py-3"
              rows={input.split('\\n').length > 1 ? Math.min(input.split('\\n').length, 5) : 1}
            />

            <button 
              onClick={handleSend}
              disabled={loading || (!input.trim() && !selectedFile)}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            Nexus processes images and audio natively using Vertex AI Gemini.
          </p>
        </div>
      </div>
    </div>
  );
}
