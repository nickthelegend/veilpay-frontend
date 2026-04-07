"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ethers } from "ethers";
import { CONTRACTS } from "@/lib/contracts";
import VAULT_ABI from "@/lib/abis/Vault.json";
import TOKEN_ABI from "@/lib/abis/TestToken.json";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, Plus, ArrowUpRight, ShieldCheck, Wallet } from "lucide-react";

export default function VaultManager() {
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const { writeContract, data: hash, isPending: isSubmitting } = useWriteContract();
  
  // Convex state
  const vaultBalance = useQuery(api.darkpool.getVaultBalance, 
    address ? { walletAddress: address, tokenAddress: CONTRACTS.TestToken } : "skip"
  );
  const updateBalance = useMutation(api.darkpool.updateVaultBalance);

  // Contract state
  const { data: tokenBalance } = useReadContract({
    address: CONTRACTS.TestToken,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: CONTRACTS.TestToken,
    abi: TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.Vault] : undefined,
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleDeposit = async () => {
    if (!depositAmount || !address) return;
    const amount = ethers.parseUnits(depositAmount, 18);

    if ((allowance as bigint) < amount) {
      writeContract({
        address: CONTRACTS.TestToken,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.Vault, amount],
      });
      return;
    }

    writeContract({
      address: CONTRACTS.Vault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [CONTRACTS.TestToken, amount],
    });
  };

  useEffect(() => {
    if (isSuccess && address) {
      // Small delay to allow chain to update, then we'd ideally poll the contract
      // For MVP, we'll just trigger a refresh logic or the indexer would update Convex
      // Here we manually trigger a balance update in Convex for immediate UX
      // (In production, the Matcher Indexer would do this via contract events)
    }
  }, [isSuccess, address]);

  return (
    <div className="card-tertiary p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ccff00]" />
            Privacy Vault
          </h3>
          <p className="text-xs text-white/50">Shield funds for private trading</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Vault Balance</p>
          <p className="text-xl font-bold font-mono text-[#ccff00]">
            {vaultBalance ? ethers.formatUnits(vaultBalance.balance, 18) : "0.00"} 
            <span className="text-sm ml-1 text-white/60">dUSDC</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <input
            type="number"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-[#ccff00]/50 transition-all group-hover:border-white/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button 
              onClick={() => setDepositAmount(ethers.formatUnits(tokenBalance as bigint || 0n, 18))}
              className="px-2 py-1 text-[10px] bg-white/10 hover:bg-white/20 rounded uppercase font-bold text-white/70 transition-colors"
            >
              Max
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDeposit}
            disabled={isSubmitting || isConfirming || !depositAmount}
            className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
          >
            {isSubmitting || isConfirming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (allowance as bigint) < ethers.parseUnits(depositAmount || "0", 18) ? (
              <>Approve dUSDC</>
            ) : (
              <>
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Deposit to Vault
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 px-1">
          <Wallet className="w-3 h-3 text-white/30" />
          <p className="text-[10px] text-white/30">
            Wallet Balance: {tokenBalance ? Number(ethers.formatUnits(tokenBalance as bigint, 18)).toFixed(2) : "0.00"} dUSDC
          </p>
        </div>
      </div>
      
      {hash && (
        <div className="mt-4 p-3 bg-[#ccff00]/5 border border-[#ccff00]/10 rounded-lg flex items-center justify-between">
          <span className="text-[10px] text-[#ccff00]/80">Transaction in progress...</span>
          <a 
            href={`${CONTRACTS.rpc.includes('testnet') ? 'https://evmtestnet.confluxscan.io' : 'https://evm.confluxscan.io'}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#ccff00] hover:underline flex items-center gap-1"
          >
            View <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
