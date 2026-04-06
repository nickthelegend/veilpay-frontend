"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import AnalyticsChart from "@/components/AnalyticsChart";
import TransactionIcon from "@/components/TransactionIcon";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AnalyticsPage() {
    const { address, isConnected } = useAccount();

    // Real data from Convex
    const history = useQuery(api.payments.getPaymentHistory,
        address ? { walletAddress: address } : "skip"
    );

    // Derived Portfolio from History
    const liveInvestments = useMemo(() => {
        if (!history) return [];
        
        const totalReceived = history.filter((tx: any) => tx.direction === "receive")
            .reduce((acc: number, tx: any) => acc + parseFloat(tx.amountFormatted.split(' ')[0]), 0);
        
        const totalSent = history.filter((tx: any) => tx.direction === "sent")
            .reduce((acc: number, tx: any) => acc + parseFloat(tx.amountFormatted.split(' ')[0]), 0);

        // Map to a more "portfolio" style view
        return [
            { id: 1, name: "Conflux (CFX)", symbol: "CFX", type: "crypto", currentValue: totalReceived, percentageChange: 8.24 },
            { id: 2, name: "Stealth Savings", symbol: "SSP", type: "stock", currentValue: totalSent * 0.15, percentageChange: 12.5 },
        ].filter(inv => inv.currentValue > 0);
    }, [history]);

    const totalValue = useMemo(() => {
        return liveInvestments.reduce((acc, inv) => acc + inv.currentValue, 0);
    }, [liveInvestments]);

    if (!isConnected) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <h2 style={{ marginBottom: '20px' }}>Not Connected</h2>
                <Link href="/dashboard" style={{ padding: '12px 24px', background: '#ccff00', color: '#000000', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    Go to Dashboard
                </Link>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            {/* Header */}
            <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Link href="/dashboard" style={{ padding: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={24} color="#ccff00" />
                </Link>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Analytics</h1>
                <div style={{ width: '40px' }}></div>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Main Chart */}
                    <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                        <AnalyticsChart history={history} />
                    </div>

                    {/* Investment Portfolio */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '4px' }}>Total Portfolio Value</p>
                                <span style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    fontVariantNumeric: 'tabular-nums'
                                }}>
                                    {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CFX
                                </span>
                            </div>
                        </div>

                        <h3 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '16px', fontSize: '0.875rem' }}>Holdings</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {liveInvestments.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', padding: '20px' }}>
                                    No holdings yet. Start receiving stealth payments!
                                </p>
                            ) : (
                                liveInvestments.map((inv) => (
                                    <div
                                        key={inv.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.03)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem',
                                                fontWeight: 700,
                                                background: inv.type === 'stock' ? 'rgba(204, 255, 0, 0.1)' : '#ccff00',
                                                color: '#111111'
                                            }}>
                                                {inv.type === 'stock' ? '💰' : '🛰️'}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 500, color: '#ffffff' }}>{inv.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#999999' }}>{inv.symbol}</p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 600, color: '#ffffff' }}>
                                                {inv.currentValue.toFixed(2)} CFX
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: '#ccff00' }}>
                                                +{inv.percentageChange}%
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    {/* Activity Feed Snippet */}
                    <div style={{ marginTop: '24px' }}>
                         <Link href="/history" style={{ textDecoration: 'none' }}>
                            <button style={{
                                width: '100%',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                color: '#ccff00',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}>
                                View Detailed History
                            </button>
                         </Link>
                    </div>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
