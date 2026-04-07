"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { 
  CheckCircle2, 
  CircleDashed, 
  XCircle, 
  Clock, 
  Hash, 
  ExternalLink,
  ArrowRight,
  History
} from "lucide-react";

export default function SwapHistory() {
  const { address } = useAccount();
  const orders = useQuery(api.darkpool.getUserOrders, 
    address ? { owner: address } : "skip"
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CircleDashed className="w-4 h-4 text-[#ccff00] animate-spin-slow" />;
      case "partially_filled": return <div className="relative w-4 h-4 "><div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" /><CircleDashed className="w-4 h-4 text-[#ccff00]" /></div>;
      case "filled": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-white/30" />;
    }
  };

  return (
    <div className="card-secondary p-6 rounded-2xl border border-white/5 bg-[#161616]/40 backdrop-blur-md">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-white/40" />
        Order History
      </h3>

      <div className="space-y-4">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-white/30 uppercase font-black tracking-widest leading-loose">No active private orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black tracking-widest text-white/20 border-b border-white/5">
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 px-4">Market</th>
                  <th className="pb-3 px-4 text-center">Side</th>
                  <th className="pb-3 px-4">Size</th>
                  <th className="pb-3 px-4">Price</th>
                  <th className="pb-3 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((o) => (
                  <tr key={o._id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                       <div className="flex justify-center">
                          {getStatusIcon(o.status)}
                       </div>
                    </td>
                    <td className="py-4 px-4">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                             <span className="text-[9px] font-black">DU</span>
                          </div>
                          <span className="text-xs font-bold text-white/80">dUSDC/CFX</span>
                       </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                       <span className={`text-[10px] px-2 py-1 rounded inline-block font-black uppercase ${
                          o.side === "buy" ? "bg-[#ccff00]/10 text-[#ccff00]" : "bg-rose-500/10 text-rose-500"
                       }`}>
                          {o.side}
                       </span>
                    </td>
                    <td className="py-4 px-4">
                       <div className="text-xs font-mono text-white/80">
                          {Number(o.amount).toFixed(2)}
                       </div>
                    </td>
                    <td className="py-4 px-4">
                       <div className="text-xs font-mono text-white/80">
                          {Number(o.price).toFixed(3)}
                       </div>
                    </td>
                    <td className="py-4 text-right">
                       <div className="text-[10px] text-white/30 font-mono">
                          {Math.floor((Date.now() - o.createdAt) / 1000 / 60)}m ago
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
