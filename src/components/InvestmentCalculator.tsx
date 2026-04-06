"use client";

import { useState, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from "recharts";
import { calculateInvestmentGrowth, formatShortCurrency } from "@/lib/calculations";

type ContributionFrequency = "daily" | "weekly" | "monthly" | "annual";

export default function InvestmentCalculator() {
    const [initialDeposit, setInitialDeposit] = useState(500);
    const [contribution, setContribution] = useState(100);
    const [frequency, setFrequency] = useState<ContributionFrequency>("weekly");
    const [years, setYears] = useState(10);
    const [annualReturn, setAnnualReturn] = useState(8);

    // Convert contribution to monthly based on frequency
    const monthlyContribution = useMemo(() => {
        switch (frequency) {
            case "daily": return contribution * 30;
            case "weekly": return contribution * 4.33;
            case "monthly": return contribution;
            case "annual": return contribution / 12;
            default: return contribution;
        }
    }, [contribution, frequency]);

    // Calculate projections
    const projections = useMemo(() => {
        return calculateInvestmentGrowth(
            initialDeposit,
            monthlyContribution,
            years,
            annualReturn / 100
        );
    }, [initialDeposit, monthlyContribution, years, annualReturn]);

    const finalProjection = projections[projections.length - 1];

    const frequencyOptions: { key: ContributionFrequency; label: string }[] = [
        { key: "annual", label: "Annual" },
        { key: "monthly", label: "Monthly" },
        { key: "weekly", label: "Weekly" },
        { key: "daily", label: "Daily" },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1a1a] border border-white/10 text-white px-4 py-3 rounded-xl shadow-2xl">
                    <p className="text-sm text-white/50 mb-2">{label}</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ccff00]"></span>
                                Investment
                            </span>
                            <span className="text-sm font-semibold">${payload[0].value.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#ccff00]/40"></span>
                                Returns
                            </span>
                            <span className="text-sm font-semibold">${payload[1].value.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-white/10">
                            <span className="text-sm font-bold text-white">Total</span>
                            <span className="text-sm font-bold text-[#ccff00]">
                                ${(payload[0].value + payload[1].value).toLocaleString('en-US')}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-8">Investment Calculator</h2>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Left: Inputs */}
                <div className="space-y-8">
                    {/* Initial Deposit */}
                    <div>
                        <label className="text-xs text-white/50 uppercase tracking-widest block mb-3 font-semibold">
                            Initial Deposit
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccff00] font-bold">$</span>
                            <input
                                type="number"
                                value={initialDeposit}
                                onChange={(e) => setInitialDeposit(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-[#ccff00] focus:outline-none transition-all text-xl font-bold text-white"
                            />
                        </div>
                    </div>

                    {/* Contribution */}
                    <div>
                        <label className="text-xs text-white/50 uppercase tracking-widest block mb-3 font-semibold">
                            Contribution Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccff00] font-bold">$</span>
                            <input
                                type="number"
                                value={contribution}
                                onChange={(e) => setContribution(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 focus:border-[#ccff00] focus:outline-none transition-all text-xl font-bold text-white"
                            />
                        </div>

                        {/* Frequency selector */}
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {frequencyOptions.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => setFrequency(opt.key)}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${frequency === opt.key
                                            ? "bg-[#ccff00] text-black"
                                            : "bg-white/5 text-white/50 hover:bg-white/10"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Years slider */}
                    <div>
                        <div className="flex justify-between mb-3">
                            <label className="text-xs text-white/50 uppercase tracking-widest font-semibold">
                                Investment Term
                            </label>
                            <span className="text-lg font-bold text-[#ccff00]">{years} years</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full accent-[#ccff00]"
                        />
                        <div className="flex justify-between text-[10px] text-white/30 mt-2 font-bold uppercase">
                            <span>1 year</span>
                            <span>30 years</span>
                        </div>
                    </div>

                    {/* Annual return */}
                    <div>
                        <div className="flex justify-between mb-3">
                            <label className="text-xs text-white/50 uppercase tracking-widest font-semibold">
                                Annual Average Return
                            </label>
                            <span className="text-lg font-bold text-[#ccff00]">{annualReturn}%</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={annualReturn}
                            onChange={(e) => setAnnualReturn(Number(e.target.value))}
                            className="w-full accent-[#ccff00]"
                        />
                    </div>
                </div>

                {/* Right: Results */}
                <div className="flex flex-col justify-center">
                    {/* Potential balance */}
                    <div className="text-center mb-10">
                        <p className="text-xs text-white/50 uppercase tracking-widest mb-3 font-semibold">
                            Potential Future Balance
                        </p>
                        <p className="text-6xl font-black text-white">
                            ${finalProjection.total.toLocaleString('en-US')}
                        </p>
                        <p className="text-sm text-[#ccff00] mt-4 font-bold">
                            in {new Date().getFullYear() + years}
                        </p>
                    </div>

                    {/* Legendary Chart */}
                    <div className="h-64 mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }}
                                    interval={Math.floor(years / 5)}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600 }}
                                    tickFormatter={(value) => formatShortCurrency(value)}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="invested" stackId="a" fill="rgba(204, 255, 0, 0.4)" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="returns" stackId="a" fill="#ccff00" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <p className="text-[10px] text-white/50 mb-1 uppercase font-bold tracking-wider">Total Investment</p>
                            <p className="text-xl font-bold">${finalProjection.invested.toLocaleString('en-US')}</p>
                        </div>
                        <div className="bg-[#ccff00]/10 rounded-2xl p-5 border border-[#ccff00]/10">
                            <p className="text-[10px] text-[#ccff00]/70 mb-1 uppercase font-bold tracking-wider">Total Return</p>
                            <p className="text-xl font-bold text-[#ccff00]">${finalProjection.returns.toLocaleString('en-US')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-white/30 mt-12 text-center max-w-2xl mx-auto leading-relaxed">
                This calculation is for illustrative purposes only. Actual returns may vary depending on market conditions. 
                Past performance is not indicative of future results. Consult a professional advisor before making investment decisions.
            </p>
        </div>
    );
}
