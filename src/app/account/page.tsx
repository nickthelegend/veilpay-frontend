"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Bell, Shield, CreditCard, Settings, HelpCircle, LogOut } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { useAccount, useDisconnect } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AccountPage() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    
    // Real data from Convex
    const profile = useQuery(api.users.getProfile,
        address ? { walletAddress: address } : "skip"
    );

    const [extendedRoundUp, setExtendedRoundUp] = useState(false);
    const [multiplier, setMultiplier] = useState(1);

    const menuItems = [
        { icon: <CreditCard size={20} />, label: "My Cards", href: "/dashboard", badge: null },
        { icon: <Bell size={20} />, label: "Notifications", href: "#", badge: "3" },
        { icon: <Shield size={20} />, label: "Security", href: "#", badge: null },
        { icon: <Settings size={20} />, label: "Settings", href: "#", badge: null },
        { icon: <HelpCircle size={20} />, label: "Help", href: "#", badge: null },
    ];

    if (!isConnected) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>Not Connected</h2>
                <p style={{ color: '#888888', textAlign: 'center', marginBottom: '30px' }}>Connect your wallet to manage your private investment account.</p>
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
            <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Link href="/dashboard" style={{ padding: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={24} color="#ccff00" />
                </Link>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Account</h1>
                <div style={{ width: '40px' }}></div>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Profile Card */}
                    <div style={{
                        background: 'linear-gradient(145deg, #1a1a1a 0%, #222222 100%)',
                        borderRadius: '24px',
                        padding: '24px',
                        color: 'white',
                        marginBottom: '20px',
                        border: '1px solid rgba(204, 255, 0, 0.1)',
                        marginTop: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(204, 255, 0, 0.1)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#ccff00',
                                border: '1px solid rgba(204, 255, 0, 0.2)'
                            }}>
                                {address?.slice(2, 4).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{profile?.displayName || `User ${address?.slice(-4)}`}</h2>
                                <p style={{ fontSize: '0.75rem', color: '#999999', fontFamily: 'monospace' }}>{address?.slice(0, 10)}...{address?.slice(-8)}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '4px' }}>Status</p>
                                <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{profile?.isRegistered ? "Verified" : "Guest"}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '4px' }}>Network</p>
                                <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>Conflux</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '4px' }}>Privacy</p>
                                <p style={{ fontWeight: 700, color: '#ccff00', fontSize: '0.875rem' }}>Stealth</p>
                            </div>
                        </div>
                    </div>

                    {/* Round-up Settings */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '20px',
                        marginBottom: '20px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <h3 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '16px' }}>VeilPay Settings</h3>

                        {/* Extended toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '16px',
                            marginBottom: '12px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(204, 255, 0, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}>
                                    ⚡
                                </div>
                                <div>
                                    <p style={{ fontWeight: 500, color: '#ffffff' }}>Aggressive Round-up</p>
                                    <p style={{ fontSize: '0.75rem', color: '#999999' }}>Above 10% round-up</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setExtendedRoundUp(!extendedRoundUp)}
                                style={{
                                    position: 'relative',
                                    width: '48px',
                                    height: '28px',
                                    background: extendedRoundUp ? '#ccff00' : '#333333',
                                    borderRadius: '14px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <span style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: extendedRoundUp ? '23px' : '3px',
                                    width: '22px',
                                    height: '22px',
                                    background: extendedRoundUp ? '#000000' : '#ffffff',
                                    borderRadius: '50%',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                                }}></span>
                            </button>
                        </div>

                        {/* Multiplier */}
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontWeight: 500, color: '#ffffff', marginBottom: '4px' }}>Round-up Multiplier</p>
                            <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '12px' }}>Multiplier for faster accumulation</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {[1, 2, 5, 10].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setMultiplier(opt)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            background: multiplier === opt ? '#ccff00' : 'rgba(255,255,255,0.05)',
                                            color: multiplier === opt ? '#000000' : '#999999',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {opt}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Menu */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {menuItems.map((item, i) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    textDecoration: 'none',
                                    borderBottom: i < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(204, 255, 0, 0.1)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ccff00'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ fontWeight: 500, color: '#ffffff' }}>{item.label}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {item.badge && (
                                        <span style={{
                                            padding: '2px 8px',
                                            background: '#ccff00',
                                            color: '#000000',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            borderRadius: '10px'
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                    <ChevronRight size={20} color="#666666" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Logout */}
                    <button 
                        onClick={() => disconnect()}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '16px',
                            background: 'rgba(220, 38, 38, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            borderRadius: '16px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={20} />
                        Disconnect Wallet
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666666', marginTop: '20px' }}>
                        VeilPay v1.0.0 • Connected
                    </p>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
