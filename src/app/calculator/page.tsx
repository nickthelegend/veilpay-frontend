"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import MobileNav from "@/components/MobileNav";
import { calculateInvestmentGrowth } from "@/lib/calculations";
import PageTransition from "@/components/PageTransition";

type ContributionFrequency = "daily" | "weekly" | "monthly" | "annual";

export default function CalculatorPage() {
    const [initialDeposit, setInitialDeposit] = useState(500);
    const [contribution, setContribution] = useState(100);
    const [frequency, setFrequency] = useState<ContributionFrequency>("weekly");
    const [years, setYears] = useState(10);
    const [annualReturn, setAnnualReturn] = useState(8);

    const monthlyContribution = useMemo(() => {
        switch (frequency) {
            case "daily": return contribution * 30;
            case "weekly": return contribution * 4.33;
            case "monthly": return contribution;
            case "annual": return contribution / 12;
            default: return contribution;
        }
    }, [contribution, frequency]);

    const projections = useMemo(() => {
        return calculateInvestmentGrowth(initialDeposit, monthlyContribution, years, annualReturn / 100);
    }, [initialDeposit, monthlyContribution, years, annualReturn]);

    const finalProjection = projections[projections.length - 1];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#1a1a1a',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(204, 255, 0, 0.2)'
                }}>
                    <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px' }}>{label}</p>
                    <p style={{ fontSize: '0.875rem' }}>
                        <span style={{ color: 'rgba(204, 255, 0, 0.4)' }}>●</span> Invested: ${payload[0].value.toLocaleString('en-US')}
                    </p>
                    <p style={{ fontSize: '0.875rem' }}>
                        <span style={{ color: '#ccff00' }}>●</span> Returns: ${payload[1].value.toLocaleString('en-US')}
                    </p>
                    <p style={{ fontWeight: 700, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#ccff00' }}>
                        Total: ${(payload[0].value + payload[1].value).toLocaleString('en-US')}
                    </p>
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
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>Calculator</h1>
                <div style={{ width: '40px' }}></div>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Calculator Card */}
                    <div style={{
                        background: 'linear-gradient(145deg, #1a1a1a 0%, #222222 100%)',
                        borderRadius: '24px',
                        padding: '24px',
                        color: 'white',
                        border: '1px solid rgba(204, 255, 0, 0.1)',
                        marginTop: '20px'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', color: '#ccff00' }}>Investment Calculator</h2>

                        {/* Initial Deposit */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                                Initial Deposit
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccff00', fontWeight: 600 }}>$</span>
                                <input
                                    type="number"
                                    value={initialDeposit}
                                    onChange={(e) => setInitialDeposit(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 40px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        color: 'white',
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Contribution */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                                Contribution Amount
                            </label>
                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ccff00', fontWeight: 600 }}>$</span>
                                <input
                                    type="number"
                                    value={contribution}
                                    onChange={(e) => setContribution(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 40px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        color: 'white',
                                        fontSize: '1.25rem',
                                        fontWeight: 600,
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Frequency */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                {[
                                    { key: 'annual' as const, label: 'Yearly' },
                                    { key: 'monthly' as const, label: 'Monthly' },
                                    { key: 'weekly' as const, label: 'Weekly' },
                                    { key: 'daily' as const, label: 'Daily' }
                                ].map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setFrequency(opt.key)}
                                        style={{
                                            padding: '10px 8px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            background: frequency === opt.key ? '#ccff00' : 'rgba(255,255,255,0.05)',
                                            color: frequency === opt.key ? '#000000' : '#999999',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Years Slider */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Investment Period
                                </label>
                                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ccff00' }}>{years} years</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#ccff00' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#666666', marginTop: '4px' }}>
                                <span>1 year</span>
                                <span>30 years</span>
                            </div>
                        </div>

                        {/* Annual Return Slider */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Annual Return
                                </label>
                                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ccff00' }}>{annualReturn}%</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={annualReturn}
                                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#ccff00' }}
                            />
                        </div>

                        {/* Result */}
                        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', background: 'rgba(204, 255, 0, 0.05)', borderRadius: '20px', border: '1px solid rgba(204, 255, 0, 0.1)' }}>
                            <p style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                Potential Future Balance
                            </p>
                            <p style={{ fontSize: '3rem', fontWeight: 700, color: '#ccff00', lineHeight: 1 }}>
                                ${Math.round(finalProjection.total).toLocaleString('en-US')}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#666666', marginTop: '8px' }}>
                                in year {new Date().getFullYear() + years}
                            </p>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(204, 255, 0, 0.3)' }}></span>
                                <span style={{ fontSize: '0.75rem', color: '#999999' }}>Invested</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ccff00' }}></span>
                                <span style={{ fontSize: '0.75rem', color: '#999999' }}>Returns</span>
                            </div>
                        </div>

                        {/* Chart */}
                        <div style={{ height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projections} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis
                                        dataKey="year"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#666666', fontSize: 10 }}
                                        interval={Math.floor(years / 5)}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#666666', fontSize: 10 }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="invested" stackId="a" fill="rgba(204, 255, 0, 0.3)" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="returns" stackId="a" fill="#ccff00" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.6875rem', color: '#999999', marginBottom: '4px' }}>Total Invested</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>${Math.round(finalProjection.invested).toLocaleString('en-US')}</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.6875rem', color: '#999999', marginBottom: '4px' }}>Total Returns</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ccff00' }}>${Math.round(finalProjection.returns).toLocaleString('en-US')}</p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <p style={{ fontSize: '0.6875rem', color: '#666666', marginTop: '24px', textAlign: 'center', lineHeight: 1.5 }}>
                            This calculation is for illustrative purposes only. Actual returns may vary based on market conditions.
                        </p>
                    </div>

                    {/* Tips */}
                    <div style={{
                        marginTop: '24px',
                        background: 'rgba(204, 255, 0, 0.05)',
                        borderRadius: '24px',
                        padding: '24px',
                        border: '1px solid rgba(204, 255, 0, 0.1)'
                    }}>
                        <h3 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>📊 Round-up Simulation</h3>
                        <p style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '20px' }}>
                            On average, $0.50 is rounded up per transaction. With 3 transactions per day:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Daily', value: '$1.50' },
                                { label: 'Monthly', value: '$45' },
                                { label: 'Yearly', value: '$547' }
                            ].map((item) => (
                                <div key={item.label} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '16px',
                                    padding: '12px',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <p style={{ fontSize: '0.6875rem', color: '#999999', marginBottom: '4px' }}>{item.label}</p>
                                    <p style={{ fontWeight: 700, color: '#ccff00' }}>{item.value}</p>
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

