"use client";

import { Menu, Bell, X, User, Settings, Shield, Clock, HelpCircle, LogOut, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "VeilPay." }: HeaderProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const profile = useQuery(api.users.getProfile, address ? { walletAddress: address } : "skip");

    const sidebarItems = [
        { icon: <User size={20} />, label: "Profile", href: "/account" },
        { icon: <CreditCard size={20} />, label: "Dashboard", href: "/dashboard" },
        { icon: <Clock size={20} />, label: "History", href: "/history" },
        { icon: <HelpCircle size={20} />, label: "Faucet", href: "/faucet" },
        { icon: <Shield size={20} />, label: "Privacy Settings", href: "/account" },
        { icon: <Settings size={20} />, label: "App Settings", href: "/account" },
        { icon: <HelpCircle size={20} />, label: "Help & Support", href: "/account" },
    ];

    const notifications = [
        { id: 1, title: "Payment Received", message: "You received 0.5 CFX in a stealth address.", time: "2m ago", unread: true },
        { id: 2, title: "Shield Registered", message: "Your stealth identity is now live on-chain.", time: "1h ago", unread: false },
        { id: 3, title: "New Feature", message: "Inbox is now available in the main menu.", time: "2h ago", unread: false },
    ];

    return (
        <>
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '430px', margin: '0 auto' }}>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '12px' }}
                >
                    <Menu size={24} color="#ccff00" />
                </button>

                <Link href="/dashboard" style={{ fontSize: '1.375rem', fontWeight: 800, color: '#ffffff', textDecoration: 'none', fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '-0.02em' }}>
                    VeilPay<span style={{ color: '#ccff00' }}>.</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                        onClick={() => setIsNotificationsOpen(true)}
                        style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '12px', position: 'relative' }}
                    >
                        <Bell size={22} color="#ccff00" />
                        {notifications.some(n => n.unread) && (
                            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ccff00', borderRadius: '50%', border: '2px solid #111' }}></span>
                        )}
                    </button>
                    <ConnectButton showBalance={false} accountStatus="avatar" chainStatus="icon" />
                </div>
            </div>
        </header>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }} onClick={() => setIsSidebarOpen(false)}>
                <div 
                    style={{ width: '80%', maxWidth: '300px', height: '100%', background: '#111', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', animation: 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #ccff00 0%, #aaff00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000' }}>
                                {address ? address.slice(2, 4).toUpperCase() : "V"}
                            </div>
                            <div>
                                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}>{profile?.walletAddress ? `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}` : "Guest User"}</p>
                                <p style={{ color: '#888', fontSize: '0.75rem' }}>{profile?.isRegistered ? "Pro Shield" : "Basic"}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ flex: 1, padding: '24px 12px', overflowY: 'auto' }}>
                        {sidebarItems.map((item, i) => (
                            <Link key={i} href={item.href} onClick={() => setIsSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', color: '#fff', textDecoration: 'none', transition: 'all 0.2s', marginBottom: '4px' }}>
                                <div style={{ color: '#ccff00' }}>{item.icon}</div>
                                <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9375rem' }}>{item.label}</span>
                                <ChevronRight size={16} color="#444" />
                            </Link>
                        ))}
                    </div>

                    <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button 
                            onClick={() => { disconnect(); setIsSidebarOpen(false); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                            <LogOut size={20} />
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Notifications Modal/Overlay */}
        {isNotificationsOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px' }} onClick={() => setIsNotificationsOpen(false)}>
                <div 
                    style={{ width: 'calc(100% - 40px)', maxWidth: '380px', background: '#1a1a1a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ color: '#fff', fontWeight: 700 }}>Notifications</h3>
                        <button onClick={() => setIsNotificationsOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div key={n.id} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', position: 'relative', background: n.unread ? 'rgba(204, 255, 0, 0.02)' : 'transparent' }}>
                                    {n.unread && <div style={{ position: 'absolute', left: '10px', top: '24px', width: '4px', height: '4px', background: '#ccff00', borderRadius: '50%' }}></div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{n.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#555' }}>{n.time}</p>
                                    </div>
                                    <p style={{ fontSize: '0.8125rem', color: '#888', lineHeight: 1.4 }}>{n.message}</p>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#555' }}>No new notifications</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        <style jsx>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
            @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
        </>
    );
}

