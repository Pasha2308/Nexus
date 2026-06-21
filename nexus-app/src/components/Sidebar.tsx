"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, MessageSquare, LayoutDashboard, Search, LogOut, Sunrise, Server } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/briefing", label: "Daily Briefing", icon: Sunrise },
    { href: "/chat", label: "Nexus Chat", icon: MessageSquare },
    { href: "/dashboard", label: "Memory Graph", icon: LayoutDashboard },
    { href: "/search", label: "Semantic Search", icon: Search },
    { href: "/mcp", label: "MCP Server", icon: Server },
  ];

  return (
    <div className="w-64 h-screen bg-black border-r border-gray-800 flex flex-col p-4 shrink-0">
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="p-2 bg-blue-600/20 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
        </div>
        <span className="text-xl font-bold text-white tracking-wide">Nexus</span>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}>
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Exit Nexus</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
