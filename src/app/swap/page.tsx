"use client";

import SwapInterface from "@/components/SwapInterface";
import VaultManager from "@/components/VaultManager";
import DarkOrderBook from "@/components/DarkOrderBook";
import SwapHistory from "@/components/SwapHistory";
import { Shield, Zap, Lock, Info, Activity, Globe, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
         <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#ccff00]/5 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Partition */}
        <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <Link href="/" className="group flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#ccff00] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                        <Shield className="w-6 h-6 text-black fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none">VEILPAY</h1>
                        <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Dark Pool Protocol</p>
                    </div>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-6 text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
                <Link href="/dashboard" className="hover:text-[#ccff00] transition-colors flex items-center gap-1.5"><LayoutDashboard className="w-3 h-3" /> Dashboard</Link>
                <Link href="/swap" className="text-[#ccff00] transition-colors flex items-center gap-1.5"><Zap className="w-3 h-3 fill-current" /> Swap</Link>
                <Link href="/settings" className="hover:text-[#ccff00] transition-colors flex items-center gap-1.5"><Settings className="w-3 h-3" /> Settings</Link>
            </div>

            <div className="flex items-center gap-3">
                 <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Conflux Testnet</span>
                 </div>
            </div>
        </header>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Core Swap & Vault */}
            <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                <SwapInterface />
                <VaultManager />
            </div>

            {/* Right Column: Live Data & History */}
            <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                <DarkOrderBook />
                <SwapHistory />
            </div>

        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#ccff00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Decentralized Matcher</span>
                </div>
            </div>
            <p className="text-[10px] font-mono">v0.1.0-alpha // conflux_espace_71</p>
        </footer>
      </div>

      {/* Decorative Orbs */}
      <div className="fixed top-1/2 left-0 w-1 h-32 bg-gradient-to-b from-transparent via-[#ccff00]/20 to-transparent -translate-y-1/2 blur-sm" />
      <div className="fixed top-1/2 right-0 w-1 h-32 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent -translate-y-1/2 blur-sm" />
    </div>
  );
}
