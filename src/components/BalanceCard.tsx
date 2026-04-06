"use client";

import { TrendingUp } from "lucide-react";

interface BalanceCardProps {
    totalBalance: number;
    percentageChange: number;
    label?: string;
}

export default function BalanceCard({
    totalBalance,
    percentageChange,
    label = "Total Balance"
}: BalanceCardProps) {
    const isPositive = percentageChange >= 0;

    return (
        <div style={{
            background: '#1a1a1a',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            border: '1px solid #2a2a2a'
        }}>
            <p style={{ fontSize: '0.875rem', color: '#888888', marginBottom: '4px' }}>{label}</p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff' }}>
                    {Math.floor(totalBalance).toLocaleString('en-US')}
                </span>
                <span style={{ fontSize: '1.25rem', color: '#888888' }}>
                    .{(totalBalance % 1).toFixed(4).split('.')[1]} CFX
                </span>
            </div>

            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: isPositive ? 'rgba(204, 255, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: isPositive ? '#ccff00' : '#ef4444',
                border: `1px solid ${isPositive ? 'rgba(204, 255, 0, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
                <TrendingUp size={14} />
                <span>{isPositive ? "+" : ""}{percentageChange.toFixed(2)}% this week</span>
            </div>
        </div>
    );
}
