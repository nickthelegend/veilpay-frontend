"use client";

import { formatCurrency, getTimeAgo } from "@/lib/calculations";
import type { Transaction } from "@/lib/mockData";

interface TransactionListProps {
    transactions: Transaction[];
    showInvested?: boolean;
}

export default function TransactionList({
    transactions,
    showInvested = true
}: TransactionListProps) {
    return (
        <div className="rounded-2xl p-6 border border-white/5 bg-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Recent Transactions</h3>
                <button className="text-sm text-[#ccff00] font-semibold hover:underline">
                    See All
                </button>
            </div>

            <div className="space-y-4">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#ccff00]/10 text-[#ccff00] rounded-xl flex items-center justify-center text-lg">
                                {tx.icon}
                            </div>
                            <div>
                                <p className="font-medium text-white">{tx.merchant}</p>
                                <p className="text-xs text-white/50">{tx.category} • {getTimeAgo(tx.date)}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-semibold text-white">-${tx.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            {showInvested && tx.investedAmount > 0 && (
                                <p className="text-xs text-[#ccff00] font-semibold">
                                    +${tx.investedAmount.toFixed(2)} invested
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
