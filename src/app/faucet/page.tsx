"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ethers } from "ethers";
import { CONTRACTS } from "@/lib/contracts";
import TOKEN_ABI from "@/lib/abis/TestToken.json";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { Loader2, Coins, ArrowRight, Wallet, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function FaucetPage() {
    const { address } = useAccount();
    const [mintAmount, setMintAmount] = useState("1000");

    const { writeContract, data: hash, isPending: isMinting } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const { data: balance } = useReadContract({
        address: CONTRACTS.TestToken,
        abi: TOKEN_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    const handleMint = () => {
        if (!address) return;
        writeContract({
            address: CONTRACTS.TestToken,
            abi: TOKEN_ABI,
            functionName: "faucet",
            args: [address, ethers.parseUnits(mintAmount, 18)],
        });
    };

    return (
        <main className="mobile-container">
            <Header title="Faucet" />
            
            <PageTransition>
                <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Hero Section */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: 'rgba(204, 255, 0, 0.1)', 
                            borderRadius: '30px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 24px' 
                        }}>
                            <Coins size={40} color="#ccff00" />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                            dUSDC Faucet
                        </h1>
                        <p style={{ color: '#888', fontSize: '0.9375rem', lineHeight: 1.5, maxWidth: '280px', margin: '0 auto' }}>
                            Mint free test tokens to explore the VeilPay ZK Dark Pool.
                        </p>
                    </div>

                    {/* Stats Card */}
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        borderRadius: '24px', 
                        padding: '24px', 
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Wallet size={20} color="#888" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Balance</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                                        {balance ? Number(ethers.formatUnits(balance as bigint, 18)).toLocaleString() : "0.00"}
                                        <span style={{ fontSize: '0.875rem', color: '#888', marginLeft: '6px' }}>dUSDC</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.8125rem', color: '#555', fontWeight: 600, textTransform: 'uppercase' }}>Mint Amount</label>
                            <input 
                                type="number"
                                value={mintAmount}
                                onChange={(e) => setMintAmount(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    color: '#fff',
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button 
                            onClick={handleMint}
                            disabled={isMinting || isConfirming || !address}
                            style={{
                                width: '100%',
                                padding: '18px',
                                borderRadius: '20px',
                                background: '#ccff00',
                                color: '#111',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '1.0625rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: (isMinting || isConfirming || !address) ? 0.6 : 1
                            }}
                        >
                            {isMinting || isConfirming ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    <span>{isConfirming ? "Confirming..." : "Minting..."}</span>
                                </>
                            ) : (
                                <>
                                    <span>Mint Tokens</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        {isSuccess && (
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: 'rgba(74, 222, 128, 0.1)', 
                                padding: '16px', 
                                borderRadius: '16px', 
                                border: '1px solid rgba(74, 222, 128, 0.2)',
                                animation: 'fadeIn 0.3s ease-out'
                            }}>
                                <CheckCircle2 size={20} color="#4ade80" />
                                <p style={{ fontSize: '0.875rem', color: '#4ade80', fontWeight: 600 }}>Successfully minted {mintAmount} dUSDC!</p>
                            </div>
                        )}
                    </div>

                    {/* Info Card */}
                    <div style={{ 
                        padding: '20px', 
                        background: 'rgba(204, 255, 0, 0.05)', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(204, 255, 0, 0.1)' 
                    }}>
                        <p style={{ fontSize: '0.8125rem', color: '#888', lineHeight: 1.6 }}>
                            These tokens are exclusively for use on the **Conflux eSpace Testnet**. They hold no real monetary value.
                        </p>
                    </div>
                </div>
            </PageTransition>

            <MobileNav />
            
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </main>
    );
}
