"use client";

import { useState, useMemo } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TimeFilter = "day" | "week" | "month";

interface AnalyticsChartProps {
    history?: any[];
}

export default function AnalyticsChart({ history = [] }: AnalyticsChartProps) {
    const [filter, setFilter] = useState<TimeFilter>("week");

    // Transform history into chart data
    const chartData = useMemo(() => {
        if (!history || history.length === 0) return [];

        // Sort by date
        const sorted = [...history].sort((a, b) => (a.sentAt || a.discoveredAt) - (b.sentAt || b.discoveredAt));
        
        let cumulativeBalance = 0;
        return sorted.map(tx => {
            const amount = parseFloat(tx.amountFormatted.split(' ')[0]);
            if (tx.direction === "receive") {
                cumulativeBalance += amount;
            } else {
                cumulativeBalance -= amount;
            }
            
            return {
                date: new Date(tx.sentAt || tx.discoveredAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                balance: cumulativeBalance,
                timestamp: tx.sentAt || tx.discoveredAt
            };
        });
    }, [history]);

    const stats = useMemo(() => {
        const totalSent = history?.filter((tx: any) => tx.direction === "sent")
            .reduce((acc: number, tx: any) => acc + parseFloat(tx.amountFormatted.split(' ')[0]), 0) || 0;
        
        const totalReceived = history?.filter((tx: any) => tx.direction === "receive")
            .reduce((acc: number, tx: any) => acc + parseFloat(tx.amountFormatted.split(' ')[0]), 0) || 0;

        return {
            sent: totalSent,
            received: totalReceived,
            yield: totalSent > 0 ? ((totalReceived / totalSent) * 100).toFixed(1) : "0.0"
        };
    }, [history]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1a1a] border border-white/10 text-white px-4 py-3 rounded-xl shadow-2xl">
                    <p className="text-lg font-bold text-[#ccff00]">{payload[0].value.toFixed(2)} CFX</p>
                    <p className="text-xs text-white/50 mt-1">{label}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
            {/* Header with filters */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-semibold text-white tracking-tight">Analytics</h3>
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                    {["day", "week", "month"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as TimeFilter)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f
                                    ? "bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10"
                                    : "text-white/50 hover:text-white"
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Period navigation */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">Activity Tracking</p>
                    <p className="text-2xl font-bold text-white">
                        {history.length > 0 ? "Live Flow" : "No Data Yet"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
                        <ChevronLeft size={20} className="text-white/80" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
                        <ChevronRight size={20} className="text-white/80" />
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 mb-6">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600 }}
                                tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                                dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ccff00', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="#ccff00"
                                strokeWidth={3}
                                fill="url(#colorBalance)"
                                dot={false}
                                activeDot={{ r: 6, fill: "#ccff00", strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <p className="text-white/30 text-sm">Waiting for stealth transactions...</p>
                    </div>
                )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Total Sent</p>
                    <p className="font-bold text-white">{stats.sent.toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Received</p>
                    <p className="font-bold text-[#ccff00]">{stats.received.toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Yield</p>
                    <p className="font-bold text-[#ccff00]">+{stats.yield}%</p>
                </div>
            </div>
        </div>
    );
}
