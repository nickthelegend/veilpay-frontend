"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp, Target, Calendar, BrainCircuit } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";

import AIInsights from "@/components/AIInsights";
import { useAccount } from "wagmi";

export default function AIInsightsPage() {
    const { isConnected } = useAccount();

    if (!isConnected) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: '20px' }}>
                <Sparkles size={64} color="#ccff00" style={{ marginBottom: '24px', opacity: 0.2 }} />
                <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 700 }}>AI Analysis Locked</h2>
                <p style={{ color: '#888888', textAlign: 'center', marginBottom: '30px', maxWidth: '280px' }}>Connect your wallet to analyze your privacy score and get AI-driven insights.</p>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            <header style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
                    AI <span style={{ color: '#ccff00' }}>Insights</span>
                </h1>
                <div style={{ padding: '8px 12px', background: 'var(--primary-muted)', borderRadius: '12px', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--primary)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Live Analysis</span>
                </div>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto', marginTop: '24px' }}>
                    <AIInsights />
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
