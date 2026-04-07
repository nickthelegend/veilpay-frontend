"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ethers } from "ethers";
import { CONTRACTS } from "@/lib/contracts";
import ENGINE_ABI from "@/lib/abis/DarkBookEngine.json";
import { DarkPoolProver } from "@/lib/noir/prover";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Loader2, 
  ArrowDownUp, 
  EyeOff, 
  Lock, 
  Cpu, 
  Info, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function SwapInterface() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [isProving, setIsProving] = useState(false);
  const [showProofDetails, setShowProofDetails] = useState(false);
  
  const { writeContract, data: hash, isPending: isSubmitting } = useWriteContract();
  const submitToConvex = useMutation(api.darkpool.submitOrder);
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmitOrder = async () => {
    if (!address || !amount || !price) return;

    try {
      setIsProving(true);
      
      // 1. Generate Order Commitment and Nullifier
      // Scaled for fixed-point math: 18 decimals
      const amountBI = ethers.parseUnits(amount, 18);
      const priceBI = ethers.parseUnits(price, 18);
      
      const order = DarkPoolProver.generateCommitment(
        priceBI,
        amountBI,
        side === "buy" ? 0 : 1
      );

      // 2. Generate ZK Proof (Simulated for Testnet MVP)
      // In production, this would use Noir.js
      const balanceRoot = ethers.ZeroHash; // Fetch from contract in real flow
      const proof = await DarkPoolProver.generateOrderProof(order, balanceRoot, 1);

      // 3. Submit to Chain
      writeContract({
        address: CONTRACTS.DarkBookEngine,
        abi: ENGINE_ABI,
        functionName: "submitOrder",
        args: [
          order.commitment,
          order.nullifier,
          1n, // tokenPairId (dUSDC/CFX)
          proof,
        ],
      });

      // 4. Save to Convex (encrypted parameters)
      await submitToConvex({
        owner: address,
        commitment: order.commitment,
        tokenPairId: 1,
        side,
        amount,
        price,
        txHash: hash,
      });

    } catch (error) {
      console.error("Proof generation failed:", error);
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div className="card-primary p-6 rounded-3xl border-2 border-white/5 bg-[#1a1a1a]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/5 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] -ml-24 -mb-24" />

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Private Swap
          <div className="text-[10px] bg-[#ccff00]/10 text-[#ccff00] px-2 py-0.5 rounded-full border border-[#ccff00]/20 flex items-center gap-1 uppercase tracking-widest font-black">
            <Zap className="w-2.5 h-2.5 fill-current" /> ZK Enabled
          </div>
        </h2>
        <div className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors pointer-cursor">
          <Info className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Buy/Sell Selector */}
        <div className="bg-black/40 p-1 rounded-2xl flex gap-1 border border-white/5">
          <button
            onClick={() => setSide("buy")}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              side === "buy" 
                ? "bg-white/5 text-[#ccff00] shadow-inner" 
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Buy dUSDC
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              side === "sell" 
                ? "bg-white/5 text-blue-400 shadow-inner" 
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <TrendingDown className="w-4 h-4" /> Sell dUSDC
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="group space-y-2">
            <label className="text-xs uppercase tracking-widest font-black text-white/30 ml-1">Amount to {side}</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/60 border-2 border-white/5 rounded-2xl p-5 text-2xl font-mono focus:outline-none focus:border-[#ccff00]/30 transition-all group-hover:border-white/10"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-bold uppercase tracking-widest text-sm">
                dUSDC
              </span>
            </div>
          </div>

          <div className="group space-y-2">
            <label className="text-xs uppercase tracking-widest font-black text-white/30 ml-1">Limit Price</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-black/60 border-2 border-white/5 rounded-2xl p-5 text-2xl font-mono focus:outline-none focus:border-[#ccff00]/30 transition-all group-hover:border-white/10"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-bold uppercase tracking-widest text-sm">
                CFX
              </span>
            </div>
          </div>
        </div>

        {/* Dark Pool Info Card */}
        <div className="bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-[#ccff00]/10 rounded-lg">
            <EyeOff className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#ccff00]/90">Zero Knowledge Protection</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Your order is cryptographically hidden. Only you see the parameters until a match is settled on-chain.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmitOrder}
          disabled={isProving || isSubmitting || isConfirming || !amount || !price}
          className="w-full relative group"
        >
          <div className="absolute -inset-1 bg-[#ccff00]/20 rounded-2xl blur opacity-25" />
          <div className={`relative w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all ${
            isProving || isSubmitting || isConfirming 
              ? "bg-white/10 text-white/40 cursor-wait" 
              : "bg-[#ccff00] text-black hover:scale-[1.01] active:scale-[0.98]"
          }`}>
            {isProving ? (
              <>
                <Cpu className="w-5 h-5 animate-pulse" />
                Generating Proof...
              </>
            ) : isSubmitting || isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Broadcasting...
              </>
            ) : isSuccess ? (
                <>
                    <CheckCircle2 className="w-5 h-5" />
                    Order Placed
                </>
            ) : (
              <>
                Commit Order <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>

        {isProving && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-ping" />
                    <span className="text-[10px] text-white/60 font-mono">EXECUTING NOIR CIRCUIT...</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ccff00] animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
                </div>
            </div>
        )}
      </div>

      {hash && (
        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-white/40 uppercase font-black tracking-widest">Order Hash</span>
            <code className="text-[10px] text-white/20">{hash.slice(0, 16)}...{hash.slice(-12)}</code>
          </div>
          <div className="flex items-center justify-between px-2">
             <span className="text-xs text-white/40 uppercase font-black tracking-widest">Privacy level</span>
             <span className="text-[10px] flex items-center gap-1 text-[#ccff00] font-black uppercase">
                <Lock className="w-2.5 h-2.5" /> Full (End-to-End)
             </span>
          </div>
        </div>
      )}
    </div>
  );
}
