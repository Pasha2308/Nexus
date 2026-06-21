"use client";

import Link from "next/link";
import { BrainCircuit, MessageSquare, LayoutDashboard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center font-sans overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-3xl px-6"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <BrainCircuit className="w-16 h-16 text-blue-400" />
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Nexus</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed">
          Your 10x Multimodal Executive Assistant. <br/> 
          The permanent context engine for your entire network.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/chat">
            <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
              <MessageSquare className="w-5 h-5" />
              Open Nexus Chat
            </button>
          </Link>
          
          <Link href="/dashboard">
            <button className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold text-lg backdrop-blur-xl transition-all hover:scale-105">
              <LayoutDashboard className="w-5 h-5" />
              Memory Dashboard
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Pills */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-10 flex gap-6 z-10"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          End-to-End Encrypted Memory
        </div>
      </motion.div>
    </div>
  );
}
