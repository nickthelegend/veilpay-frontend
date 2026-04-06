"use client";

import { Plus } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import BalanceCard from "@/components/BalanceCard";
import CardCarousel from "@/components/CardCarousel";
import TransactionIcon from "@/components/TransactionIcon";
import PageTransition from "@/components/PageTransition";
import AIInsightWidget from "@/components/AIInsightWidget";
import { demoUser, cards, recentTransactions } from "@/lib/mockData";

export default function DashboardPage() {
    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px' }}>
            <Header />

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Balance */}
                    <div className="page-transition stagger-1" style={{ opacity: 0 }}>
                        <BalanceCard
                            totalBalance={demoUser.totalBalance}
                            percentageChange={2.8}
                        />
                    </div>

                    {/* Cards section */}
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h2 style={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem' }}>
                                Linked Cards ({cards.length})
                            </h2>
                            <button style={{
                                width: '32px',
                                height: '32px',
                                background: 'rgba(204, 255, 0, 0.2)',
                                border: 'none',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}>
                                <Plus size={18} color="#ccff00" />
                            </button>
                        </div>

                        <CardCarousel cards={cards} />
                    </div>


                    {/* AI Insights Card */}
                    <div style={{ marginTop: '24px' }}>
                        <AIInsightWidget />
                    </div>

                    {/* Recent transactions */}
                    <div style={{ marginTop: '24px' }}>
                        <div style={{
                            background: '#1a1a1a',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            border: '1px solid #2a2a2a'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: 600, color: '#ffffff' }}>Recent Activity</h3>
                                <button style={{
                                    fontSize: '0.875rem',
                                    color: '#ccff00',
                                    fontWeight: 500,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}>
                                    View All
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {recentTransactions.slice(0, 5).map((tx) => (
                                    <div
                                        key={tx.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <TransactionIcon icon={tx.icon} />
                                            <div>
                                                <p style={{ fontWeight: 500, color: '#ffffff', fontSize: '0.9375rem' }}>{tx.merchant}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#888888' }}>{tx.category}</p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 500, color: '#ffffff' }}>
                                                -${tx.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                            {tx.investedAmount > 0 && (
                                                <p style={{ fontSize: '0.75rem', color: '#ccff00', fontWeight: 500 }}>
                                                    +${tx.investedAmount.toFixed(2)} invested
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Investment summary */}
                    <div style={{
                        marginTop: '24px',
                        background: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        color: 'white',
                        border: '1px solid #333'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: 600 }}>Wealth Overview</h3>
                            <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>This month</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '4px' }}>Total Payouts</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>${demoUser.totalInvested.toLocaleString('en-US')}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '4px' }}>Total Yield</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ccff00' }}>+${demoUser.totalReturns.toLocaleString('en-US')}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ opacity: 0.7 }}>Growth Rate</span>
                                <span style={{ fontWeight: 700, color: '#ccff00' }}>+{((demoUser.totalReturns / demoUser.totalInvested) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
