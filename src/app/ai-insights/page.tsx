"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp, Target, Calendar, BrainCircuit } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";

export default function AIInsightsPage() {
    const yearEndProjection = 38450;
    const insightCount = 5;

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            {/* Header */}
            <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Link href="/dashboard" style={{ padding: '8px', textDecoration: 'none' }}>
                    <ArrowLeft size={24} color="#ccff00" />
                </Link>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ffffff' }}>AI Guide</h1>
                <div style={{ width: '40px' }} /> {/* Spacer for centering */}
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>

                    {/* Hero / Summary Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(204, 255, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        marginTop: '20px'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1) 0%, rgba(204, 255, 0, 0) 100%)',
                            borderRadius: '50%'
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(204, 255, 0, 0.1)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={24} color="#ccff00" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Analysis Report</h2>
                                <p style={{ fontSize: '0.875rem', color: '#999999', margin: 0 }}>Last update: Today 09:41</p>
                            </div>
                        </div>

                        <p style={{ fontSize: '1rem', color: '#cccccc', lineHeight: '1.6', marginBottom: '20px' }}>
                            I have analyzed your spending habits. You can save up to <strong style={{ color: '#ccff00' }}>${yearEndProjection.toLocaleString('en-US')}</strong> by the end of the year.
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#ccff00'
                            }}>
                                <BrainCircuit size={14} />
                                {insightCount} recommendations
                            </span>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '16px', paddingLeft: '4px' }}>
                        Recommendations for You
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Insight Card 1 */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Target size={20} color="#3b82f6" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Spending Threshold</h4>
                                    <p style={{ fontSize: '0.875rem', color: '#999999', lineHeight: '1.5' }}>
                                        You are 15% above your monthly average in grocery shopping. I recommend setting a $1,200 limit for next week.
                                    </p>
                                    <button style={{
                                        marginTop: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#ccff00',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}>
                                        Set Goal →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Insight Card 2 */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <TrendingUp size={20} color="#22c55e" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Investment Opportunity</h4>
                                    <p style={{ fontSize: '0.875rem', color: '#999999', lineHeight: '1.5' }}>
                                        Returns on technology stocks in your portfolio are trending up. Adding an extra $500 could bring your year-end goal 2 weeks closer.
                                    </p>
                                    <button style={{
                                        marginTop: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#ccff00',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}>
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Insight Card 3 */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Calendar size={20} color="#8b5cf6" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Recurring Purchase</h4>
                                    <p style={{ fontSize: '0.875rem', color: '#999999', lineHeight: '1.5' }}>
                                        Automating your monthly gold purchase on the 15th could earn you a commission discount.
                                    </p>
                                    <button style={{
                                        marginTop: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#ccff00',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer'
                                    }}>
                                        Set Auto-Purchase →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
