"use client";

import { useState } from "react";
import { ArrowRight, Zap, Play } from "lucide-react";

interface RoundUpWidgetProps {
    onToggleExtended?: (value: boolean) => void;
}

export default function RoundUpWidget({ onToggleExtended }: RoundUpWidgetProps) {
    const [amount, setAmount] = useState(127.50);
    const [isExtended, setIsExtended] = useState(false);

    const calculateRoundUp = (value: number, extended: boolean) => {
        if (extended) {
            const nextFive = Math.ceil(value / 5) * 5;
            const nextTen = Math.ceil(value / 10) * 10;
            const basicDiff = nextFive - value;
            // If the standard round-up is less than 10% of the value, boost it to the next 10
            if (basicDiff / value < 0.10) {
                return nextTen || 10;
            }
            return nextFive || 5;
        }
        return (Math.ceil(value / 5) * 5) || 5;
    };

    const roundedAmount = calculateRoundUp(amount, isExtended);
    const investedAmount = Math.max(0, roundedAmount - amount);

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 600, color: '#ffffff' }}>Round-up Preview</h3>
                <button
                    onClick={() => {
                        setIsExtended(!isExtended);
                        onToggleExtended?.(!isExtended);
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: isExtended ? '#ccff00' : 'rgba(255,255,255,0.05)',
                        color: isExtended ? '#000000' : '#999999',
                        transition: 'all 0.2s'
                    }}
                >
                    <Zap size={14} fill={isExtended ? "currentColor" : "none"} />
                    {isExtended ? "Boosted" : "Standard"}
                </button>
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.75rem', color: '#999999', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Spending Amount
                </label>
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#ccff00',
                        fontWeight: 600
                    }}>$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '16px 16px 16px 40px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                </div>
            </div>

            {/* Visualization */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(204, 255, 0, 0.05)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(204, 255, 0, 0.1)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6875rem', color: '#999999', marginBottom: '4px' }}>Spending</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>${amount.toFixed(2)}</p>
                </div>

                <ArrowRight size={20} color="#ccff00" />

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6875rem', color: '#999999', marginBottom: '4px' }}>Rounded</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>${roundedAmount.toFixed(2)}</p>
                </div>

                <div style={{
                    background: '#ccff00',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(204, 255, 0, 0.2)'
                }}>
                    <p style={{ fontSize: '0.625rem', color: '#000000', fontWeight: 600, marginBottom: '2px', opacity: 0.6 }}>Invested</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 800, color: '#000000' }}>+${investedAmount.toFixed(2)}</p>
                </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#666666', marginTop: '16px', textAlign: 'center', fontStyle: 'italic' }}>
                {isExtended
                    ? "Boosted mode: Rounds to next $10 if difference is <10%"
                    : "Standard mode: Rounds up to the nearest $5"
                }
            </p>
        </div>
    );
}

