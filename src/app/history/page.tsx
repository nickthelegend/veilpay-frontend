"use client";

import { Search, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import TransactionIcon from "@/components/TransactionIcon";
import PageTransition from "@/components/PageTransition";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function HistoryPage() {
    const { address, isConnected } = useAccount();
    
    // Real data from Convex
    const history = useQuery(api.payments.getPaymentHistory, 
        address ? { walletAddress: address } : "skip"
    );

    if (!isConnected) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>Not Connected</h2>
                <p style={{ color: '#888888', textAlign: 'center', marginBottom: '30px' }}>Connect your wallet to view your private payment history.</p>
                <Link href="/dashboard" style={{
                    padding: '12px 24px',
                    background: '#ccff00',
                    color: '#000000',
                    borderRadius: '12px',
                    fontWeight: 700,
                    textDecoration: 'none'
                }}>
                    Go to Dashboard
                </Link>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            {/* Header */}
            <header style={{ 
                padding: '16px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#111111',
                zIndex: 10,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Link href="/dashboard" style={{ padding: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={24} color="#ccff00" />
                </Link>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600 }}>History</h1>
                <div style={{ width: '40px' }}></div>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Search & Filter */}
                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Search size={18} color="#666" />
                            <input 
                                type="text" 
                                placeholder="Search transactions..." 
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '12px',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button style={{
                            width: '44px',
                            height: '44px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Filter size={20} color="#ccff00" />
                        </button>
                    </div>

                    {/* Transactions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {history === undefined ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <div className="animate-pulse" style={{ color: '#888888' }}>Loading your private records...</div>
                            </div>
                        ) : history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666666' }}>
                                <p>No stealth transactions found yet.</p>
                                <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Start scanning for incoming payments!</p>
                            </div>
                        ) : (
                            history.map((tx: any) => (
                                <div
                                    key={tx._id}
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
                                        <TransactionIcon icon={tx.direction === "sent" ? "send" : "receive"} />
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9375rem' }}>
                                                {tx.direction === "sent" ? "Sent Stealth Payment" : "Received Stealth Payment"}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                                                {new Date(tx.sentAt || tx.discoveredAt).toLocaleDateString()} at {new Date(tx.sentAt || tx.discoveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ 
                                            fontWeight: 700, 
                                            color: tx.direction === "sent" ? "#ffffff" : "#ccff00",
                                            fontSize: '1rem'
                                        }}>
                                            {tx.direction === "sent" ? "-" : "+"}${tx.amountFormatted.split(' ')[0]}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: tx.status === 'confirmed' ? '#4ade80' : '#888888' }}>
                                            {tx.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
