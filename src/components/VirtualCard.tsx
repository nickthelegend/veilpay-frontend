"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CreditCard, Shield, RefreshCcw, Wallet, Copy, Check } from "lucide-react";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatStealthMetaAddress } from "@/lib/stealth";
import { CONTRACTS } from "@/lib/contracts";

export default function VirtualCard() {
    const { address } = useAccount();
    const [balance, setBalance] = useState<string>("0.00");
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    
    const profile = useQuery(api.users.getProfile, address ? { walletAddress: address } : "skip");
    const payments = useQuery(api.payments.getReceivedPayments, address ? { walletAddress: address } : "skip");

    useEffect(() => {
        const fetchBalance = async () => {
            if (!address) return;
            try {
                const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
                const bal = await provider.getBalance(address);
                setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
            } catch (err) {
                console.error("Balance fetch failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [address]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!address) return null;

    return (
        <div style={{ width: '100%' }}>
            {/* The Visual Card */}
            <div style={{
                width: '100%',
                aspectRatio: '1.586/1', // Standard CR80 ratio
                background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                borderRadius: '24px',
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(204, 255, 0, 0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                {/* Gloss/Reflections */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle at 30% 30%, rgba(204, 255, 0, 0.05) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--primary-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={24} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Veil<span style={{ color: 'var(--primary)' }}>Pay</span></h3>
                            <p style={{ fontSize: '0.625rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Private Card</p>
                        </div>
                    </div>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }} />
                        eSpace Testnet
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0 }}>
                            {isLoading ? "---" : balance}
                        </h2>
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)' }}>CFX</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                    <div>
                        <p style={{ fontSize: '0.625rem', color: 'var(--foreground-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Stealth ID</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'white', opacity: 0.8 }}>
                            {profile?.spendingPubKey && profile?.viewingPubKey 
                                ? formatStealthMetaAddress(profile.spendingPubKey + profile.viewingPubKey.slice(2)) 
                                : "Not registered"}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '32px', height: '20px', borderRadius: '4px', background: 'white', opacity: 0.1 }} />
                        <div style={{ width: '32px', height: '20px', borderRadius: '4px', background: 'var(--primary)', opacity: 0.3 }} />
                    </div>
                </div>
            </div>

            {/* Quick Actions/Info below card */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'var(--background-secondary)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Wallet size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>Usage</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                        {payments?.length ?? 0}
                        <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--foreground-muted)', marginLeft: '6px' }}>Payments</span>
                    </div>
                </div>
                <div style={{ background: 'var(--background-secondary)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <RefreshCcw size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>Status</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Active
                        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
                    </div>
                </div>
            </div>

                <button 
                    onClick={() => {
                        const meta = (profile?.spendingPubKey && profile?.viewingPubKey) 
                            ? profile.spendingPubKey + profile.viewingPubKey.slice(2) 
                            : "";
                        if (meta) copyToClipboard(meta);
                    }}
                    style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '16px',
                        background: 'transparent',
                        border: '1px dashed var(--border)',
                        borderRadius: '16px',
                        color: 'var(--foreground-muted)',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {copied ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
                    {copied ? "Copied Stealth Meta-Address" : "Copy Stealth Meta-Address"}
                </button>
        </div>
    );
}
