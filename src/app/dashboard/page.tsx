"use client";

import { Plus } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import BalanceCard from "@/components/BalanceCard";
import CardCarousel from "@/components/CardCarousel";
import TransactionIcon from "@/components/TransactionIcon";
import PageTransition from "@/components/PageTransition";
import AIInsightWidget from "@/components/AIInsightWidget";
import { cards } from "@/lib/mockData";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    
    // Real data from Convex
    const history = useQuery(api.payments.getPaymentHistory, 
        address ? { walletAddress: address } : "skip"
    );
    
    const profile = useQuery(api.users.getProfile,
        address ? { walletAddress: address } : "skip"
    );

    // Mock stats for demo if profile doesn't exist
    const totalBalance = profile?.isRegistered ? 25480.50 : 0;
    const totalInvested = profile?.isRegistered ? 3245.80 : 0;
    const totalReturns = profile?.isRegistered ? 412.35 : 0;

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px' }}>
            <Header />

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Welcome Section */}
                    {!isConnected && (
                        <div style={{ marginTop: '20px', textAlign: 'center', padding: '20px', background: 'rgba(204, 255, 0, 0.05)', borderRadius: '20px', border: '1px dashed #ccff00' }}>
                            <p style={{ color: '#ccff00', fontWeight: 600 }}>Connect your wallet to get started</p>
                        </div>
                    )}

                    {/* Balance */}
                    <div className="page-transition stagger-1" style={{ opacity: isConnected ? 1 : 0.5, transition: 'opacity 0.5s' }}>
                        <BalanceCard
                            totalBalance={totalBalance}
                            percentageChange={isConnected ? 2.8 : 0}
                        />
                    </div>

                    {/* Cards section */}
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h2 style={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem' }}>
                                Linked Cards ({isConnected ? cards.length : 0})
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

                        <CardCarousel cards={isConnected ? cards : []} />
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
                                {!isConnected ? (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#888888', fontSize: '0.875rem' }}>
                                        Connect wallet to view history
                                    </p>
                                ) : history === undefined ? (
                                    <div style={{ padding: '20px', textAlign: 'center' }}>
                                        <div className="animate-pulse" style={{ color: '#888888' }}>Loading...</div>
                                    </div>
                                ) : history.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#888888', fontSize: '0.875rem' }}>
                                        No transactions yet.
                                    </p>
                                ) : (
                                    history.slice(0, 5).map((tx: any) => (
                                        <div
                                            key={tx._id}
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
                                                <TransactionIcon icon={tx.direction === "sent" ? "send" : "receive"} />
                                                <div>
                                                    <p style={{ fontWeight: 500, color: '#ffffff', fontSize: '0.9375rem' }}>
                                                        {tx.direction === "sent" ? "Sent Payment" : "Received Payment"}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                                                        {new Date(tx.sentAt || tx.discoveredAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: 500, color: tx.direction === "sent" ? "#ffffff" : "#ccff00" }}>
                                                    {tx.direction === "sent" ? "-" : "+"}${tx.amountFormatted.split(' ')[0]}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                                                    {tx.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                            <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Lifetime</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '4px' }}>Total Payouts</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>${totalInvested.toLocaleString('en-US')}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '4px' }}>Total Yield</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ccff00' }}>+${totalReturns.toLocaleString('en-US')}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ opacity: 0.7 }}>Growth Rate</span>
                                <span style={{ fontWeight: 700, color: '#ccff00' }}>
                                    {totalInvested > 0 ? `+${((totalReturns / totalInvested) * 100).toFixed(1)}%` : "0.0%"}
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
