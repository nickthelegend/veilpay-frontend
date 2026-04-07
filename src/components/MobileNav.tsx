"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Send, Zap, User, Inbox } from "lucide-react";

const navItems = [
    { href: "/dashboard", icon: CreditCard, label: "Home" },
    { href: "/payments", icon: Send, label: "Pay" },
    { href: "/swap", icon: Zap, label: "Swap" },
    { href: "/inbox", icon: Inbox, label: "Inbox" },
    { href: "/account", icon: User, label: "Profile" },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '400px',
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '12px 8px',
            zIndex: 100,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href === "/dashboard" && pathname === "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '8px 16px',
                                textDecoration: 'none',
                                color: isActive ? '#ccff00' : '#888888',
                                transition: 'all 0.2s ease',
                                borderRadius: '16px',
                                background: isActive ? 'rgba(204, 255, 0, 0.1)' : 'transparent'
                            }}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                            <span style={{
                                fontSize: '10px',
                                fontWeight: isActive ? 600 : 500,
                                letterSpacing: '0.02em',
                                marginTop: '2px'
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
