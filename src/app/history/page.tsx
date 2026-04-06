"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import TransactionIcon from "@/components/TransactionIcon";
import PageTransition from "@/components/PageTransition";
import { recentTransactions } from "@/lib/mockData";

export default function HistoryPage() {

    const groupedTransactions = recentTransactions.reduce((groups, tx) => {
        const date = tx.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(tx);
        return groups;
    }, {} as Record<string, typeof recentTransactions>);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            {/* Header */}
            <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Link href="/dashboard" style={{ padding: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={24} color="#ccff00" />
                </Link>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>History</h1>
                <button style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Download size={22} color="#ccff00" />
                </button>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Summary */}
                    <div style={{
                        background: 'linear-gradient(145deg, #1a1a1a 0%, #222222 100%)',
                        borderRadius: '24px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(204, 255, 0, 0.1)',
                        marginTop: '20px'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '8px' }}>Total Round-up This Month</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
                                ${recentTransactions.reduce((acc, tx) => acc + tx.investedAmount, 0).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#ccff00', fontWeight: 600 }}>+12.3%</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#666666', marginTop: '8px' }}>
                            Amount rounded up from {recentTransactions.length} transactions
                        </p>
                    </div>

                    {/* Transactions */}
                    {Object.entries(groupedTransactions).map(([date, txs]) => (
                        <div key={date} style={{ marginBottom: '24px' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#666666', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {formatDate(date)}
                            </p>

                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {txs.map((tx, i) => (
                                    <div
                                        key={tx.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            borderBottom: i < txs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <TransactionIcon icon={tx.icon} />
                                            <div>
                                                <p style={{ fontWeight: 500, color: '#ffffff' }}>{tx.merchant}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#999999' }}>{tx.category}</p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 600, color: '#ffffff' }}>
                                                -${tx.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                            {tx.investedAmount > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                                    <span style={{ width: '6px', height: '6px', background: '#ccff00', borderRadius: '50%' }}></span>
                                                    <span style={{ fontSize: '0.75rem', color: '#ccff00', fontWeight: 600 }}>
                                                        +${tx.investedAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Load more */}
                    <button style={{
                        width: '100%',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        fontWeight: 600,
                        color: '#ccff00',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}>
                        Load More
                    </button>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}

