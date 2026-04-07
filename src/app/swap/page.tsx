"use client";

import SwapInterface from "@/components/SwapInterface";
import DarkOrderBook from "@/components/DarkOrderBook";
import SwapHistory from "@/components/SwapHistory";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { Shield } from "lucide-react";
import { useAccount } from "wagmi";

export default function SwapPage() {
    const { isConnected } = useAccount();

    if (!isConnected) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: '20px' }}>
                <Shield size={64} color="#ccff00" style={{ marginBottom: '24px', opacity: 0.2 }} />
                <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 700 }}>Private Swap Locked</h2>
                <p style={{ color: '#888888', textAlign: 'center', marginBottom: '30px', maxWidth: '280px' }}>Connect your wallet to trade privately in the Dark Pool.</p>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '110px', color: '#ffffff' }}>
            <header style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
                    Swap <span style={{ color: '#ccff00' }}>Privately</span>
                </h1>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    <div style={{ animation: 'fadeIn 0.3s ease-in', marginTop: '24px' }}>
                        
                        {/* Swap Logic Container */}
                        <div style={{ marginBottom: '40px' }}>
                            <SwapInterface />
                        </div>

                        {/* Order Book / Live Matches Section */}
                        <div style={{ marginBottom: '40px' }}>
                             <DarkOrderBook />
                        </div>

                        {/* Recent History Section */}
                        <div style={{ paddingBottom: '20px' }}>
                             <SwapHistory />
                        </div>

                    </div>
                </main>
            </PageTransition>

            <MobileNav />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
