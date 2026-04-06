"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import {
    dailyBalanceHistory,
    weeklyBalanceHistory,
    monthlyBalanceHistory,
    investments
} from "@/lib/mockData";

type TimeFilter = "day" | "week" | "month";

export default function AnalyticsPage() {
    const [filter, setFilter] = useState<TimeFilter>("week");

    // Get chart data based on filter
    const chartData = useMemo(() => {
        switch (filter) {
            case "day":
                return dailyBalanceHistory;
            case "week":
                return weeklyBalanceHistory;
            case "month":
                return monthlyBalanceHistory;
            default:
                return weeklyBalanceHistory;
        }
    }, [filter]);

    // Period label based on filter
    const periodLabel = useMemo(() => {
        switch (filter) {
            case "day":
                return { main: "Today", sub: "January 31, 2026" };
            case "week":
                return { main: "Week 5", sub: "January 2026" };
            case "month":
                return { main: "January", sub: "2026" };
            default:
                return { main: "Week 5", sub: "January 2026" };
        }
    }, [filter]);

    // Live price fluctuation state
    const [liveInvestments, setLiveInvestments] = useState(investments.map(inv => ({
        ...inv,
        currentValue: inv.currentValue,
        percentageChange: inv.percentageChange
    })));

    // Update prices every 3 seconds with small random fluctuations
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveInvestments(prev => prev.map(inv => {
                // Random change between -0.5% and +0.5%
                const changePercent = (Math.random() - 0.5) * 1;
                const newValue = inv.currentValue * (1 + changePercent / 100);
                const newPercentage = inv.percentageChange + (Math.random() - 0.45) * 0.3;

                return {
                    ...inv,
                    currentValue: Math.round(newValue * 100) / 100,
                    percentageChange: Math.round(newPercentage * 100) / 100
                };
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filters: { key: TimeFilter; label: string }[] = [
        { key: "day", label: "Day" },
        { key: "week", label: "Week" },
        { key: "month", label: "Month" },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#1a1a1a',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(204, 255, 0, 0.2)'
                }}>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ccff00' }}>${payload[0].value.toLocaleString('en-US')}</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{label}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            {/* Header */}
            <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Link href="/dashboard" style={{ padding: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={24} color="#ccff00" />
                </Link>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Analytics</h1>
                <div style={{ width: '40px' }}></div>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Filter tabs */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        padding: '4px',
                        marginBottom: '24px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {filters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: filter === f.key ? '#ccff00' : 'transparent',
                                    color: filter === f.key ? '#000000' : '#999999',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Period */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: '#999999' }}>{periodLabel.sub}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>{periodLabel.main}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                                <ChevronLeft size={20} color="#ffffff" />
                            </button>
                            <button style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                                <ChevronRight size={20} color="#ffffff" />
                            </button>
                        </div>
                    </div>

                    {/* Chart */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ccff00" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#666666', fontSize: 11 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#666666', fontSize: 11 }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#ccff00"
                                        strokeWidth={3}
                                        fill="url(#colorBalance)"
                                        dot={false}
                                        activeDot={{ r: 6, fill: "#ccff00", strokeWidth: 2, stroke: "#111111" }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '4px' }}>This Week</p>
                                <p style={{ fontWeight: 700, color: '#ffffff' }}>+$1,980</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '4px' }}>Invested</p>
                                <p style={{ fontWeight: 700, color: '#ccff00' }}>+$265</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#999999', marginBottom: '4px' }}>Returns</p>
                                <p style={{ fontWeight: 700, color: '#ccff00' }}>+8.2%</p>
                            </div>
                        </div>
                    </div>

                    {/* Investment Portfolio */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {/* Total at top */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '4px' }}>Total Portfolio Value</p>
                                <span style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    fontVariantNumeric: 'tabular-nums'
                                }}>
                                    ${liveInvestments.reduce((acc, inv) => acc + inv.currentValue, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div style={{
                                padding: '6px 12px',
                                background: 'rgba(204, 255, 0, 0.1)',
                                borderRadius: '20px',
                                border: '1px solid rgba(204, 255, 0, 0.2)'
                            }}>
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: '#ccff00',
                                    fontVariantNumeric: 'tabular-nums'
                                }}>
                                    +{((liveInvestments.reduce((acc, inv) => acc + inv.percentageChange, 0) / liveInvestments.length)).toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        <h3 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '16px', fontSize: '0.875rem' }}>Investments</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {liveInvestments.map((inv) => (
                                <div
                                    key={inv.id}
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
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: inv.type === 'crypto' ? '1.25rem' : '0.75rem',
                                            fontWeight: 700,
                                            background: inv.type === 'stock' ? 'rgba(204, 255, 0, 0.1)' :
                                                inv.type === 'crypto' ? '#f7931a' : '#fbbf24',
                                            color: inv.type === 'stock' ? '#ccff00' : 'white',
                                            letterSpacing: '-0.02em',
                                            border: inv.type === 'stock' ? '1px solid rgba(204, 255, 0, 0.2)' : 'none'
                                        }}>
                                            {inv.type === 'stock' ? 'STK' : inv.type === 'crypto' ? '₿' : 'Au'}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#ffffff' }}>{inv.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#999999' }}>{inv.symbol}</p>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontWeight: 600,
                                            color: '#ffffff',
                                            transition: 'all 0.3s ease',
                                            fontVariantNumeric: 'tabular-nums'
                                        }}>
                                            ${inv.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            color: inv.percentageChange >= 0 ? '#ccff00' : '#ef4444',
                                            transition: 'all 0.3s ease',
                                            fontVariantNumeric: 'tabular-nums'
                                        }}>
                                            {inv.percentageChange >= 0 ? '+' : ''}{inv.percentageChange.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
