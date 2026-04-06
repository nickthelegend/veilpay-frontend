"use client";

import { useState } from "react";
import { TrendingUp, Bitcoin, Coins, Check } from "lucide-react";

interface InvestmentOption {
    id: string;
    type: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    riskLevel: string;
    expectedReturn: string;
    allocation: number;
}

interface InvestmentSelectorProps {
    onAllocationChange?: (allocations: Record<string, number>) => void;
}

export default function InvestmentSelector({ onAllocationChange }: InvestmentSelectorProps) {
    const [allocations, setAllocations] = useState<Record<string, number>>({
        stock: 40,
        crypto: 30,
        gold: 30,
    });

    const options: InvestmentOption[] = [
        {
            id: "stock",
            type: "stock",
            name: "Stocks",
            icon: <TrendingUp size={24} />,
            description: "Blue-chip stocks & ETFs",
            riskLevel: "Medium",
            expectedReturn: "8-15%",
            allocation: allocations.stock,
        },
        {
            id: "crypto",
            type: "crypto",
            name: "Crypto Assets",
            icon: <Bitcoin size={24} />,
            description: "BTC, ETH, and more",
            riskLevel: "High",
            expectedReturn: "15-50%",
            allocation: allocations.crypto,
        },
        {
            id: "gold",
            type: "gold",
            name: "Gold",
            icon: <Coins size={24} />,
            description: "Safe haven investment",
            riskLevel: "Low",
            expectedReturn: "5-10%",
            allocation: allocations.gold,
        },
    ];

    const handleSliderChange = (id: string, value: number) => {
        const total = Object.values(allocations).reduce((a, b) => a + b, 0);
        const currentValue = allocations[id];
        const diff = value - currentValue;

        // Adjust other allocations proportionally
        const otherKeys = Object.keys(allocations).filter(k => k !== id);
        const otherTotal = total - currentValue;

        if (otherTotal > 0) {
            const newAllocations = { ...allocations, [id]: value };

            otherKeys.forEach(key => {
                const ratio = allocations[key] / otherTotal;
                newAllocations[key] = Math.max(
                    0,
                    Math.round(allocations[key] - diff * ratio)
                );
            });

            // Ensure total is 100
            const newTotal = Object.values(newAllocations).reduce((a, b) => a + b, 0);
            if (newTotal !== 100) {
                const lastKey = otherKeys[otherKeys.length - 1];
                newAllocations[lastKey] += 100 - newTotal;
            }

            setAllocations(newAllocations);
            onAllocationChange?.(newAllocations);
        }
    };

    const riskColors = {
        "Low": "text-[#4ade80] bg-[#4ade80]/10",
        "Medium": "text-[#fbbf24] bg-[#fbbf24]/10",
        "High": "text-[#ef4444] bg-[#ef4444]/10",
    };

    const themeColors = ["#ccff00", "#ffffff", "rgba(255,255,255,0.4)"];

    return (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-6 tracking-tight">Investment Allocation</h3>

            {/* Pie chart visualization */}
            <div className="flex justify-center mb-8">
                <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {(() => {
                            let startAngle = 0;
                            return options.map((opt, i) => {
                                const angle = (opt.allocation / 100) * 360;
                                const endAngle = startAngle + angle;
                                const largeArc = angle > 180 ? 1 : 0;

                                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                                const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
                                startAngle = endAngle;

                                return (
                                    <path
                                        key={opt.id}
                                        d={path}
                                        fill={themeColors[i]}
                                        className="transition-all duration-500 ease-in-out"
                                        style={{ filter: i === 0 ? 'drop-shadow(0 0 8px rgba(204, 255, 0, 0.4))' : 'none' }}
                                    />
                                );
                            });
                        })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black text-white">100%</span>
                    </div>
                </div>
            </div>

            {/* Options with sliders */}
            <div className="space-y-4">
                {options.map((option, index) => (
                    <div key={option.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                    style={{ 
                                        backgroundColor: themeColors[index],
                                        color: index === 0 ? '#000000' : '#000000'
                                    }}
                                >
                                    {option.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{option.name}</p>
                                    <p className="text-xs text-white/50">{option.description}</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-[#ccff00]">{option.allocation}%</span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={option.allocation}
                            onChange={(e) => handleSliderChange(option.id, Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
                        />

                        <div className="flex items-center justify-between mt-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${riskColors[option.riskLevel as keyof typeof riskColors]}`}>
                                {option.riskLevel} Risk
                            </span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Est. Return: {option.expectedReturn}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
