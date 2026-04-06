"use client";

import { Menu, Bell } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface HeaderProps {
    title?: string;
}

export default function Header({ title = "VeilPay." }: HeaderProps) {
    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: '#111111',
            padding: '16px 20px',
            borderBottom: '1px solid #2a2a2a'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                maxWidth: '430px',
                margin: '0 auto'
            }}>
                <button style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '12px'
                }}>
                    <Menu size={24} color="#ccff00" />
                </button>

                <Link href="/dashboard" style={{
                    fontSize: '1.375rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                    letterSpacing: '-0.02em'
                }}>
                    VeilPay<span style={{ color: '#ccff00' }}>.</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ConnectButton
                        showBalance={false}
                        accountStatus="avatar"
                        chainStatus="icon"
                    />
                    <button style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        position: 'relative'
                    }}>
                        <Bell size={22} color="#ccff00" />
                        <span style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '8px',
                            height: '8px',
                            background: '#ccff00',
                            borderRadius: '50%'
                        }}></span>
                    </button>
                </div>
            </div>
        </header>
    );
}

