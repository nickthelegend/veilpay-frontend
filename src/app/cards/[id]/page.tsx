"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MoreVertical, CreditCard as CardIcon, Lock, RefreshCw, Trash2, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useState } from "react";
import MobileNav from "@/components/MobileNav";
import CreditCard from "@/components/CreditCard";
import TransactionIcon from "@/components/TransactionIcon";
import PageTransition from "@/components/PageTransition";
import { cards, recentTransactions } from "@/lib/mockData";

export default function CardDetailPage() {
    const params = useParams();
    const cardId = params.id as string;
    const card = cards.find(c => c.id === cardId);
    const [showBalance, setShowBalance] = useState(true);
    const [showMenu, setShowMenu] = useState(false);

    if (!card) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>Card not found</p>
                    <Link href="/dashboard" style={{ color: '#ccff00', fontWeight: 500, textDecoration: 'none' }}>Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    // Filter transactions for this card (demo: show all)
    const cardTransactions = recentTransactions.slice(0, 5);

    const menuItems = [
        { icon: <Lock size={20} />, label: "Lock Card", color: '#ffffff' },
        { icon: <RefreshCw size={20} />, label: "Change Limit", color: '#ffffff' },
        { icon: <CardIcon size={20} />, label: "Card Details", color: '#ffffff' },
        { icon: <Trash2 size={20} />, label: "Delete Card", color: '#ef4444' },
    ];

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            {/* Header */}
            <header style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Link href="/dashboard" style={{
                    padding: '8px',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ArrowLeft size={24} color="#ccff00" />
                </Link>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Card Details</h1>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                        padding: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}
                >
                    <MoreVertical size={24} color="#ffffff" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div style={{
                        position: 'absolute',
                        top: '64px',
                        right: '20px',
                        background: '#1a1a1a',
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        zIndex: 100,
                        minWidth: '220px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }} className="animate-slide-up">
                        {menuItems.map((item, i) => (
                            <button
                                key={item.label}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px 20px',
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: i < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    cursor: 'pointer',
                                    color: item.color,
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    textAlign: 'left'
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Card Display */}
                    <div style={{ marginBottom: '24px', marginTop: '20px' }}>
                        <CreditCard card={card} variant="full" clickable={false} />
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {showBalance ? <EyeOff size={24} color="#ccff00" /> : <Eye size={24} color="#ccff00" />}
                            <span style={{ fontSize: '0.75rem', color: '#999999', fontWeight: 600 }}>
                                {showBalance ? 'Hide' : 'Show'}
                            </span>
                        </button>

                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}>
                            <Lock size={24} color="#ccff00" />
                            <span style={{ fontSize: '0.75rem', color: '#999999', fontWeight: 600 }}>Lock</span>
                        </button>

                        <button style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}>
                            <RefreshCw size={24} color="#ccff00" />
                            <span style={{ fontSize: '0.75rem', color: '#999999', fontWeight: 600 }}>Limit</span>
                        </button>
                    </div>

                    {/* Card Stats */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <h3 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '20px' }}>Monthly Summary</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '4px' }}>Total Spending</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>$4,850</p>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(204, 255, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(204, 255, 0, 0.1)' }}>
                                <p style={{ fontSize: '0.75rem', color: '#ccff00', marginBottom: '4px' }}>Round-up</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ccff00' }}>$127.50</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.875rem', color: '#999999' }}>Used Limit</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>$4,850 / $15,000</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: '32%',
                                    height: '100%',
                                    background: '#ccff00',
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease',
                                    boxShadow: '0 0 10px rgba(204, 255, 0, 0.3)'
                                }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Card Transactions */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontWeight: 600, color: '#ffffff' }}>Recent Transactions</h3>
                            <Link href="/history" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.875rem',
                                color: '#ccff00',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                See All
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {cardTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px',
                                        borderRadius: '16px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.03)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <TransactionIcon icon={tx.icon} />
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#ffffff', fontSize: '0.9375rem' }}>{tx.merchant}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#999999' }}>{tx.category}</p>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 600, color: '#ffffff' }}>
                                            -${tx.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </p>
                                        {tx.investedAmount > 0 && (
                                            <p style={{ fontSize: '0.75rem', color: '#ccff00', fontWeight: 600 }}>
                                                +${tx.investedAmount.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </PageTransition>

            <MobileNav />

            {/* Overlay for menu */}
            {showMenu && (
                <div
                    onClick={() => setShowMenu(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 50
                    }}
                />
            )}
        </div>
    );
}
