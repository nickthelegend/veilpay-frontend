"use client";

import { Plus, CreditCard as CardIcon } from "lucide-react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import BalanceCard from "@/components/BalanceCard";
import TransactionIcon from "@/components/TransactionIcon";
import PageTransition from "@/components/PageTransition";
import { useAccount, useBalance } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatEther } from "ethers";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { STEALTH_REGISTRY_ABI } from "@/lib/abi";
import { CONTRACTS } from "@/lib/contracts";
import { generateStealthKeys } from "@/lib/stealth";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    
    // Real data from Convex
    const history = useQuery(api.payments.getPaymentHistory, 
        address ? { walletAddress: address } : "skip"
    );
    
    const profile = useQuery(api.users.getProfile,
        address ? { walletAddress: address } : "skip"
    );

    const { data: balanceData } = useBalance({
        address: address,
    });

    const totalBalance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;
    
    // Calculate stats from real history
    const totalSent = history?.filter((tx: any) => tx.direction === "sent")
        .reduce((acc: number, tx: any) => acc + parseFloat(tx.amountFormatted.split(' ')[0]), 0) || 0;
    
    const totalReceived = history?.filter((tx: any) => tx.direction === "receive")
        .reduce((acc: number, tx: any) => acc + parseFloat(tx.amountFormatted.split(' ')[0]), 0) || 0;

    const totalInvested = totalSent;
    const totalReturns = totalReceived;

    const { writeContractAsync } = useWriteContract();
    const recordRegistration = useMutation(api.users.recordRegistration);
    const upsertProfile = useMutation(api.users.upsertProfile);
    const [isRegistering, setIsRegistering] = useState(false);
    const [regTxHash, setRegTxHash] = useState<`0x${string}` | undefined>();

    const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash: regTxHash,
    });

    const handleRegister = async () => {
        if (!address) return;
        
        try {
            setIsRegistering(true);
            const keys = generateStealthKeys();
            
            // 1. Register on-chain
            const hash = await writeContractAsync({
                address: CONTRACTS.StealthRegistry as `0x${string}`,
                abi: STEALTH_REGISTRY_ABI,
                functionName: "registerStealthMetaAddress",
                args: [keys.stealthMetaAddress as `0x${string}`],
            });

            setRegTxHash(hash);

            // 2. Save keys locally
            localStorage.setItem(`veilpay_keys_${address}`, JSON.stringify(keys));

            // 3. Update Convex profile pre-emptively
            await upsertProfile({
                walletAddress: address,
                spendingPubKey: keys.spendingPubKey,
                viewingPubKey: keys.viewingPubKey,
                isRegistered: true,
                registrationTxHash: hash,
            });

            await recordRegistration({
                walletAddress: address,
                spendingPubKey: keys.spendingPubKey,
                viewingPubKey: keys.viewingPubKey,
                stealthMetaAddress: keys.stealthMetaAddress,
                txHash: hash,
                blockNumber: 0,
            });

        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. See console for details.");
            setIsRegistering(false);
        }
    };

    // Use effect to handle the success toast/alert after tx is mined
    useEffect(() => {
        if (isTxSuccess) {
            setIsRegistering(false);
            alert("Stealth Identity Registered & Confirmed on Conflux!");
        }
    }, [isTxSuccess]);

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px' }}>
            <Header />

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* Welcome Section */}
                    {!isConnected && (
                        <div style={{ marginTop: '20px', textAlign: 'center', padding: '20px', background: 'rgba(204, 255, 0, 0.05)', borderRadius: '20px', border: '1px dashed #ccff00' }}>
                            <p style={{ color: '#ccff00', fontWeight: 600 }}>Connect your wallet to get started</p>
                        </div>
                    )}

                    {/* Balance */}
                    <div className="page-transition stagger-1" style={{ opacity: isConnected ? 1 : 0.5, transition: 'opacity 0.5s' }}>
                        <BalanceCard
                            totalBalance={totalBalance}
                            percentageChange={isConnected ? 2.8 : 0}
                        />
                    </div>

                    {/* Cards section */}
                    <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h2 style={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem' }}>
                                Your Stealth Identity
                            </h2>
                            <button 
                                onClick={handleRegister}
                                disabled={isRegistering || isWaitingForTx || profile?.isRegistered}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    background: profile?.isRegistered ? 'rgba(255,255,255,0.05)' : (isWaitingForTx ? 'rgba(204, 255, 0, 0.4)' : 'rgba(204, 255, 0, 0.2)'),
                                    border: 'none',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (profile?.isRegistered || isWaitingForTx) ? 'default' : 'pointer',
                                    opacity: (isRegistering || isWaitingForTx) ? 0.7 : 1
                                }}
                            >
                                <Plus size={18} color={profile?.isRegistered ? "#444" : "#ccff00"} className={isWaitingForTx ? "animate-spin" : ""} />
                            </button>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                            borderRadius: '24px',
                            padding: '24px',
                            border: '1px solid rgba(204, 255, 0, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#ccff00', filter: 'blur(60px)', opacity: 0.1 }}></div>
                            
                            <p style={{ fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Stealth Meta-Address</p>
                            
                            {profile?.spendingPubKey && profile?.viewingPubKey ? (
                                <div style={{ fontSize: '0.875rem', color: '#ffffff', fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                                    {profile.spendingPubKey}{profile.viewingPubKey.slice(2)}
                                </div>
                            ) : (
                                <p style={{ color: '#888888', fontSize: '0.875rem' }}>Not registered yet</p>
                            )}
                            
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.625rem', color: '#888888', textTransform: 'uppercase', marginBottom: '2px' }}>Status</p>
                                    <p style={{ fontSize: '0.8125rem', color: profile?.isRegistered ? '#ccff00' : '#ff4d4d', fontWeight: 600 }}>
                                        {profile?.isRegistered ? "Verified Shield" : "Unprotected"}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.625rem', color: '#888888', textTransform: 'uppercase', marginBottom: '2px' }}>Network</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 600 }}>Conflux eSpace</p>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Recent transactions */}
                    <div style={{ marginTop: '24px' }}>
                        <div style={{
                            background: '#1a1a1a',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            border: '1px solid #2a2a2a'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: 600, color: '#ffffff' }}>Recent Activity</h3>
                                <button style={{
                                    fontSize: '0.875rem',
                                    color: '#ccff00',
                                    fontWeight: 500,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}>
                                    View All
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {!isConnected ? (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#888888', fontSize: '0.875rem' }}>
                                        Connect wallet to view history
                                    </p>
                                ) : history === undefined ? (
                                    <div style={{ padding: '20px', textAlign: 'center' }}>
                                        <div className="animate-pulse" style={{ color: '#888888' }}>Loading...</div>
                                    </div>
                                ) : history.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#888888', fontSize: '0.875rem' }}>
                                        No transactions yet.
                                    </p>
                                ) : (
                                    history.slice(0, 5).map((tx: any) => (
                                        <div
                                            key={tx._id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <TransactionIcon icon={tx.direction === "sent" ? "send" : "receive"} />
                                                <div>
                                                    <p style={{ fontWeight: 500, color: '#ffffff', fontSize: '0.9375rem' }}>
                                                        {tx.direction === "sent" ? "Sent Payment" : "Received Payment"}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                                                        {new Date(tx.sentAt || tx.discoveredAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: 500, color: tx.direction === "sent" ? "#ffffff" : "#ccff00" }}>
                                                    {tx.direction === "sent" ? "-" : "+"}${tx.amountFormatted.split(' ')[0]}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                                                    {tx.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Investment summary */}
                    <div style={{
                        marginTop: '24px',
                        background: 'linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        color: 'white',
                        border: '1px solid #333'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: 600 }}>Wealth Overview</h3>
                            <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>Lifetime</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '4px' }}>Total Payouts</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>${totalInvested.toLocaleString('en-US')}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '4px' }}>Total Yield</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ccff00' }}>+${totalReturns.toLocaleString('en-US')}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ opacity: 0.7 }}>Growth Rate</span>
                                <span style={{ fontWeight: 700, color: '#ccff00' }}>
                                    {totalInvested > 0 ? `+${((totalReturns / totalInvested) * 100).toFixed(1)}%` : "0.0%"}
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
            </PageTransition>

            <MobileNav />
        </div>
    );
}
