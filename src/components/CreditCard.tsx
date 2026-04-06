"use client";

import Link from "next/link";
import { Wifi } from "lucide-react";
import type { Card } from "@/lib/mockData";

interface CreditCardProps {
    card: Card;
    variant?: "full" | "compact" | "carousel";
    clickable?: boolean;
}

export default function CreditCardComponent({ card, variant = "compact", clickable = true }: CreditCardProps) {
    const colors = {
        teal: {
            bg: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
            text: 'white',
            accent: 'rgba(204, 255, 0, 0.4)'
        },
        mint: {
            bg: 'linear-gradient(135deg, #111111 0%, #1a1a1a 50%, #111111 100%)',
            text: 'white',
            accent: 'rgba(204, 255, 0, 0.3)'
        },
        peach: {
            bg: 'linear-gradient(135deg, #1e1e1e 0%, #252525 50%, #1e1e1e 100%)',
            text: 'white',
            accent: 'rgba(204, 255, 0, 0.2)'
        },
    };

    const style = colors[card.color as keyof typeof colors] || colors.teal;

    // Carousel variant - modern animated card
    if (variant === "carousel") {
        const cardContent = (
            <div
                className="modern-card"
                style={{
                    background: style.bg,
                    borderRadius: '24px',
                    padding: '28px',
                    color: style.text,
                    width: '100%',
                    aspectRatio: '1.6 / 1',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Animated gradient orb */}
                <div className="card-orb" style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '180px',
                    height: '180px',
                    background: `radial-gradient(circle, ${style.accent} 0%, transparent 70%)`,
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                    animation: 'float 6s ease-in-out infinite'
                }} />

                {/* Second animated orb */}
                <div className="card-orb-2" style={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '-15%',
                    width: '200px',
                    height: '200px',
                    background: `radial-gradient(circle, ${style.accent} 0%, transparent 70%)`,
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                    animation: 'float 8s ease-in-out infinite reverse'
                }} />

                {/* Shimmer effect */}
                <div className="card-shimmer" style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                    transform: 'skewX(-20deg)',
                    animation: 'shimmer 4s ease-in-out infinite'
                }} />

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <span style={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase'
                    }}>
                        {card.type}
                    </span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Wifi size={18} style={{ opacity: 0.7, transform: 'rotate(90deg)' }} />
                    </div>
                </div>

                {/* Card chip and number */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        {/* Animated chip */}
                        <div className="card-chip" style={{
                            width: '50px',
                            height: '38px',
                            background: 'linear-gradient(135deg, #ccff00 0%, #aacc00 50%, #88aa00 100%)',
                            borderRadius: '8px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Chip lines */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '10%',
                                right: '10%',
                                height: '1px',
                                background: 'rgba(0,0,0,0.2)'
                            }} />
                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                top: '20%',
                                bottom: '20%',
                                width: '1px',
                                background: 'rgba(0,0,0,0.2)'
                            }} />
                        </div>
                        <span style={{
                            fontSize: '1rem',
                            fontFamily: 'monospace',
                            letterSpacing: '3px',
                            opacity: 0.9
                        }}>
                            •••• {card.lastFour}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div>
                        <p style={{
                            fontSize: '0.6875rem',
                            opacity: 0.6,
                            marginBottom: '4px',
                            letterSpacing: '0.05em'
                        }}>
                            BALANCE
                        </p>
                        <p style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: '#ccff00'
                        }}>
                            ${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '2px' }}>{card.holderName}</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{card.expiryDate}</p>
                    </div>
                </div>
            </div>
        );

        if (clickable) {
            return (
                <Link href={`/cards/${card.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    {cardContent}
                </Link>
            );
        }
        return cardContent;
    }

    // Compact and Full variants...
    const cardContent = variant === "compact" ? (
        <div style={{
            background: style.bg,
            borderRadius: '16px',
            padding: '20px',
            color: style.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
            className="credit-card-hover"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '24px',
                        background: 'linear-gradient(135deg, #ccff00, #aacc00)',
                        borderRadius: '4px'
                    }}></div>
                    <Wifi size={16} style={{ opacity: 0.7, transform: 'rotate(90deg)' }} />
                </div>
                <span style={{ fontSize: '0.875rem', opacity: 0.8, fontFamily: 'monospace' }}>
                    •••• •••• •••• {card.lastFour}
                </span>
            </div>

            <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ccff00' }}>
                    ${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: '0.6875rem', opacity: 0.7 }}>
                    {card.holderName} • {card.expiryDate}
                </p>
            </div>
        </div>
    ) : (
        // Full variant
        <div style={{
            background: style.bg,
            borderRadius: '24px',
            padding: '28px',
            color: style.text,
            minHeight: '220px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
            className="modern-card"
        >
            {/* Animated orbs */}
            <div className="card-orb" style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '180px',
                height: '180px',
                background: `radial-gradient(circle, ${style.accent} 0%, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(20px)',
                animation: 'float 6s ease-in-out infinite'
            }} />

            <div className="card-orb-2" style={{
                position: 'absolute',
                bottom: '-30%',
                left: '-15%',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${style.accent} 0%, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(30px)',
                animation: 'float 8s ease-in-out infinite reverse'
            }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.15em' }}>
                    {card.type.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>{card.holderName}</span>
            </div>

            {/* Chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                <div className="card-chip" style={{
                    width: '50px',
                    height: '38px',
                    background: 'linear-gradient(135deg, #ccff00 0%, #aacc00 50%, #88aa00 100%)',
                    borderRadius: '8px'
                }} />
                <Wifi size={24} style={{ opacity: 0.7, transform: 'rotate(90deg)' }} />
            </div>

            {/* Card number */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                fontFamily: 'monospace',
                fontSize: '1.125rem',
                letterSpacing: '2px',
                position: 'relative',
                zIndex: 1
            }}>
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span>{card.lastFour}</span>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                <div>
                    <p style={{ fontSize: '0.625rem', opacity: 0.6, textTransform: 'uppercase', marginBottom: '4px' }}>Balance</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ccff00' }}>
                        ${card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.625rem', opacity: 0.6, textTransform: 'uppercase', marginBottom: '4px' }}>Expiry</p>
                    <p style={{ fontSize: '1rem' }}>{card.expiryDate}</p>
                </div>
            </div>
        </div>
    );

    if (clickable) {
        return (
            <Link href={`/cards/${card.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}
