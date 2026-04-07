"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ethers } from "ethers";
import { 
  History, 
  Activity, 
  Layers, 
  ArrowRight, 
  Zap, 
  Hash, 
  FileCheck,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function DarkOrderBook() {
  const settlements = useQuery(api.darkpool.getRecentSettlements, { limit: 10 });

  return (
    <div className="space-y-6 flex flex-col h-full self-stretch">
      <div className="card-secondary p-6 rounded-2xl border border-white/5 bg-[#161616]/60 backdrop-blur-md flex-1">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-[#ccff00]" />
          Live Matches
          <span className="ml-auto text-[10px] bg-[#ccff00]/10 text-[#ccff00] px-2 py-0.5 rounded border border-[#ccff00]/20 font-black flex items-center gap-1">
             <Activity className="w-2.5 h-2.5" /> LIVE
          </span>
        </h3>

        <div className="space-y-3">
          {!settlements || settlements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                 <Clock className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-xs text-white/30 uppercase font-black tracking-widest leading-loose">Waiting for on-chain<br/>matching engine...</p>
            </div>
          ) : (
            settlements.map((s) => (
              <div key={s._id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group cursor-default">
                <div className="flex items-center justify-between mb-3 text-[10px] uppercase font-black tracking-widest text-[#ccff00]">
                  <div className="flex items-center gap-1.5 ">
                     <Zap className="w-3 h-3 fill-current" /> SETTLED
                  </div>
                  <div className="text-white/20 font-mono">
                    {new Date(s.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-white/40 font-mono flex items-center gap-1">
                       <Hash className="w-3 h-3" /> {s.commitmentA.slice(0, 10)}...
                    </p>
                    <div className="h-4 w-[2px] bg-white/10 ml-1" />
                    <p className="text-xs text-white/40 font-mono flex items-center gap-1">
                       <Hash className="w-3 h-3" /> {s.commitmentB.slice(0, 10)}...
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-bold text-white/90">
                       {Number(ethers.formatUnits(s.fillAmount, 18)).toFixed(2)} dUSDC
                    </p>
                    <p className="text-xs text-[#ccff00]/60 font-mono">
                       @ {Number(ethers.formatUnits(s.settlementPrice, 18)).toFixed(3)} CFX
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-1.5 text-[9px] text-[#ccff00]/60 uppercase font-black">
                      <FileCheck className="w-3 h-3" /> ZK Validated
                   </div>
                   <a 
                    href={`https://evmtestnet.confluxscan.io/tx/${s.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-white/40 hover:text-[#ccff00] transition-colors font-black uppercase flex items-center gap-1"
                   >
                     Explorer <ArrowRight className="w-2.5 h-2.5" />
                   </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Protocol Health Stats */}
      <div className="grid grid-cols-2 gap-4">
         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Total Volume</h4>
            <div className="text-lg font-bold text-white/90 font-mono">$1.2M</div>
         </div>
         <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Active Orbs</h4>
            <div className="text-lg font-bold text-[#ccff00] font-mono">28</div>
         </div>
      </div>
    </div>
  );
}
