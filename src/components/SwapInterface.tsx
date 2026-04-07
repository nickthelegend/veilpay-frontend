"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ethers } from "ethers";
import { CONTRACTS } from "@/lib/contracts";
import ENGINE_ABI from "@/lib/abis/DarkBookEngine.json";
import VAULT_ABI from "@/lib/abis/Vault.json";
import TOKEN_ABI from "@/lib/abis/TestToken.json";
import { DarkPoolProver } from "@/lib/noir/prover";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Loader2, 
  EyeOff, 
  Zap,
  TrendingDown,
  TrendingUp,
  Plus,
  ShieldCheck,
  Wallet,
  ArrowRight
} from "lucide-react";

export default function SwapInterface() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [isProving, setIsProving] = useState(false);
  
  // Matcher Service State
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [matcherPubKey, setMatcherPubKey] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081");
    ws.onopen = () => console.log("[Matcher] Connected");
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "snapshot" || msg.type === "stats") {
          if (msg.ecdhPublicKey) setMatcherPubKey(msg.ecdhPublicKey);
        }
      } catch (err) {}
    };
    setSocket(ws);
    return () => ws.close();
  }, []);
  
  // Vault State
  const [depositAmount, setDepositAmount] = useState("");
  
  const { writeContract, data: hash, isPending: isSubmitting } = useWriteContract();
  const submitToConvex = useMutation(api.darkpool.submitOrder);
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Vault & Token Data
  const vaultBalance = useQuery(api.darkpool.getVaultBalance, 
    address ? { walletAddress: address, tokenAddress: CONTRACTS.TestToken } : "skip"
  );

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

  const handleDeposit = async () => {
    if (!depositAmount || !address) return;
    const amountVal = ethers.parseUnits(depositAmount, 18);

    if ((allowance as bigint) < amountVal) {
      writeContract({
        address: CONTRACTS.TestToken,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACTS.Vault, amountVal],
      });
      return;
    }

    writeContract({
      address: CONTRACTS.Vault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [CONTRACTS.TestToken, amountVal],
    });
  };

  const handleSubmitOrder = async () => {
    if (!address || !amount || !price) return;

    try {
      setIsProving(true);
      const amountBI = ethers.parseUnits(amount, 18);
      const priceBI = ethers.parseUnits(price, 18);
      
      const order = DarkPoolProver.generateCommitment(
        priceBI,
        amountBI,
        side === "buy" ? 0 : 1
      );

      const balanceRoot = ethers.ZeroHash; 
      const proof = await DarkPoolProver.generateOrderProof(order, balanceRoot, 1);

      writeContract({
        address: CONTRACTS.DarkBookEngine,
        abi: ENGINE_ABI,
        functionName: "submitOrder",
        args: [order.commitment, order.nullifier, 1n, proof],
      });

      await submitToConvex({
        owner: address,
        commitment: order.commitment,
        tokenPairId: 1,
        side,
        amount,
        price,
        txHash: hash,
      });

      // Matcher Relay
      if (socket && socket.readyState === WebSocket.OPEN && matcherPubKey) {
        const encrypted = await DarkPoolProver.encryptForMatcher(order, matcherPubKey, address);
        socket.send(JSON.stringify({
          type: "submitOrder",
          data: encrypted
        }));
        console.log("[Matcher] Order relayed successfully");
      }

    } catch (error) {
      console.error("Order submission/relay failed:", error);
    } finally {
      setIsProving(false);
    }
  };

  const isActionDisabled = isProving || isSubmitting || isConfirming || !amount || !price;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Swap Section */}
      <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
        
        {/* Toggle Selector */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '6px', 
          borderRadius: '16px', 
          marginBottom: '24px', 
          border: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <button 
            onClick={() => setSide("buy")}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: side === "buy" ? '#ccff00' : 'transparent',
              color: side === "buy" ? '#111111' : '#888888',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <TrendingUp size={16} /> Buy dUSDC
          </button>
          <button 
            onClick={() => setSide("sell")}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: side === "sell" ? '#ccff00' : 'transparent',
              color: side === "sell" ? '#111111' : '#888888',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <TrendingDown size={16} /> Sell dUSDC
          </button>
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.875rem', color: '#888888' }}>Amount to {side}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               <Wallet size={12} color="#555555" />
               <span 
                onClick={() => setAmount(ethers.formatUnits(tokenBalance as bigint || 0n, 18))}
                style={{ fontSize: '0.75rem', color: '#555555', cursor: 'pointer', textDecoration: 'underline' }}
               >
                 {tokenBalance ? Number(ethers.formatUnits(tokenBalance as bigint, 18)).toFixed(2) : "0.00"} dUSDC
               </span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '18px',
                paddingRight: '120px',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 700,
                outline: 'none'
              }}
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <button 
                onClick={() => setAmount(ethers.formatUnits(tokenBalance as bigint || 0n, 18))}
                style={{ 
                  background: 'rgba(204,255,0,0.1)', 
                  border: '1px solid rgba(204,255,0,0.2)', 
                  color: '#ccff00', 
                  fontSize: '0.625rem', 
                  fontWeight: 800, 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  cursor: 'pointer' 
                }}
               >
                 MAX
               </button>
               <span style={{ color: '#888888', fontSize: '0.875rem', fontWeight: 700 }}>dUSDC</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Limit Price (CFX)</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '18px',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 700,
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', color: '#888888', fontSize: '0.875rem', fontWeight: 700 }}>CFX</span>
          </div>
        </div>

        <button 
          onClick={handleSubmitOrder}
          disabled={isActionDisabled}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '16px',
            background: '#ccff00',
            color: '#111111',
            border: 'none',
            fontWeight: 700,
            fontSize: '1.0625rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            opacity: isActionDisabled ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isProving ? <Loader2 size={24} className="animate-spin" /> : <Zap size={22} />}
          {isProving ? "Generating ZK Proof..." : isSubmitting || isConfirming ? "Finalizing..." : "Submit Private Order"}
        </button>

        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(204, 255, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(204, 255, 0, 0.1)', display: 'flex', gap: '12px' }}>
          <EyeOff size={20} color="#ccff00" />
          <p style={{ fontSize: '0.75rem', color: '#888888', lineHeight: 1.5 }}>
            Your order is encrypted and shielded. The matching engine will settle your trade via ZK-SNARKs without revealing your price.
          </p>
        </div>
      </div>

      {/* Integrated Vault Balance Section */}
      <div style={{ 
        padding: '24px', 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.05)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Privacy Vault</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ccff00', marginTop: '4px' }}>
              {vaultBalance ? Number(ethers.formatUnits(vaultBalance.balance, 18)).toFixed(2) : "0.00"}
              <span style={{ fontSize: '0.875rem', color: '#888888', marginLeft: '8px' }}>dUSDC</span>
            </p>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="#ccff00" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input 
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="0.00"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
          <button 
            onClick={handleDeposit}
            disabled={!depositAmount || isSubmitting || isConfirming}
            style={{
              padding: '0 20px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              opacity: (!depositAmount || isSubmitting || isConfirming) ? 0.5 : 1
            }}
          >
            {isSubmitting || isConfirming ? "..." : "Deposit"}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={14} color="#555555" />
          <p style={{ fontSize: '0.75rem', color: '#555555' }}>
            Public Balance: {tokenBalance ? Number(ethers.formatUnits(tokenBalance as bigint, 18)).toFixed(2) : "0.00"} dUSDC
          </p>
        </div>
      </div>
    </div>
  );
}
