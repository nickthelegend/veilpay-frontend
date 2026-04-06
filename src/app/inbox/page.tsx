"use client";

import { useState } from "react";
import { QrCode, Shield, Loader2, Inbox as InboxIcon, AlertCircle } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition"
import { useAccount } from "wagmi";
import { checkAnnouncement } from "@/lib/stealth";
import { ethers } from "ethers";
import { CONTRACTS } from "@/lib/contracts";
import { useAnnouncementScanner } from "@/hooks/useAnnouncementScanner";

export default function InboxPage() {
    const { address, isConnected } = useAccount();
    
    // Scan State
    const [viewPrivKey, setViewPrivKey] = useState("");
    const [lastUsedViewingKey, setLastUsedViewingKey] = useState("");
    const [spendPubKey, setSpendPubKey] = useState("");
    const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
    const { scan, scanResult, checkpoint, removePayment } = useAnnouncementScanner(address);

    const handleScan = async () => {
        if (!viewPrivKey || !spendPubKey) return;
        setLastUsedViewingKey(viewPrivKey);
        setShowKeyModal(false);
        try {
            await scan(viewPrivKey, spendPubKey, (current, total) => {
                setScanProgress({ current, total });
            });
            setViewPrivKey(""); // Clear secret from state immediately after use
        } catch (err: any) {
            alert("Scan failed: " + err.message);
        }
    };

    if (!isConnected) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: '20px' }}>
                <Shield size={64} color="#ccff00" style={{ marginBottom: '24px', opacity: 0.2 }} />
                <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 700 }}>Private Vault Locked</h2>
                <p style={{ color: '#888888', textAlign: 'center', marginBottom: '30px', maxWidth: '280px' }}>Connect your wallet to access your private inbox.</p>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            <header style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
                    Your <span style={{ color: '#ccff00' }}>Inbox</span>
                </h1>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    <div style={{ animation: 'fadeIn 0.3s ease-in', marginTop: '24px' }}>
                        <div style={{ background: 'rgba(204, 255, 0, 0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(204, 255, 0, 0.2)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <Shield size={24} color="#ccff00" />
                                <h3 style={{ fontWeight: 700 }}>Secure Scanner</h3>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#888888', lineHeight: 1.5 }}>
                                Enter your keys to find private payments. 
                                <strong> Important:</strong> Funds are discovered in "stealth" addresses and must be withdrawn to your main wallet.
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Spending Public Key</label>
                            <input 
                                type="text"
                                value={spendPubKey}
                                onChange={(e) => setSpendPubKey(e.target.value)}
                                placeholder="0x..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>

                        <button 
                            onClick={() => setShowKeyModal(true)}
                            disabled={scanResult.isScanning || !spendPubKey}
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
                                opacity: (scanResult.isScanning || !spendPubKey) ? 0.5 : 1
                            }}
                        >
                            {scanResult.isScanning ? <Loader2 size={24} className="animate-spin" /> : <QrCode size={22} />}
                            {scanResult.isScanning ? `Scanning...` : "Scan for Payments"}
                        </button>

                        {/* Found Payments List */}
                        {scanResult.matchedPayments && scanResult.matchedPayments.length > 0 && (
                            <div style={{ marginTop: '32px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#ccff00' }}>Discovered Payments</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {scanResult.matchedPayments.map((p: any, i: number) => (
                                        <div key={i} style={{ 
                                            background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '16px', 
                                            padding: '16px' 
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#888888' }}>Stealth Address</p>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, fontFamily: 'monospace' }}>{p.stealthAddress.slice(0, 10)}...{p.stealthAddress.slice(-8)}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.75rem', color: '#888888' }}>Amount</p>
                                                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ccff00' }}>{p.amountFormatted}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    if (withdrawingId) return;
                                                    try {
                                                        setWithdrawingId(p._id);
                                                        const { matched, stealthPrivKey } = checkAnnouncement(p.ephemeralPubKey, lastUsedViewingKey, p.stealthAddress);
                                                        if (!matched || !stealthPrivKey) throw new Error("Could not derive private key");
                                                        
                                                        const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
                                                        const stealthWallet = new ethers.Wallet(stealthPrivKey, provider);
                                                        
                                                        const balance = await provider.getBalance(stealthWallet.address);
                                                        const feeData = await provider.getFeeData();
                                                        const gasPrice = feeData.gasPrice || ethers.parseUnits("1", "gwei");
                                                        const gasLimit = 21000n;
                                                        const gasCost = gasPrice * gasLimit;
                                                        
                                                        if (balance <= gasCost) {
                                                            throw new Error(`Insufficient funds for gas. Balance: ${ethers.formatEther(balance)} CFX, Required: ${ethers.formatEther(gasCost)} CFX.`);
                                                        }

                                                        const tx = await stealthWallet.sendTransaction({
                                                            to: address,
                                                            value: balance - gasCost,
                                                            gasPrice,
                                                            gasLimit
                                                        });
                                                        
                                                        await tx.wait();
                                                        alert(`Withdrawal Success!`);
                                                        removePayment(p._id);
                                                    } catch (err: any) {
                                                        alert(err.message);
                                                    } finally {
                                                        setWithdrawingId(null);
                                                    }
                                                }}
                                                disabled={!!withdrawingId}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    background: withdrawingId === p._id ? 'rgba(204, 255, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                                                    color: withdrawingId === p._id ? '#ccff00' : 'white',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    cursor: withdrawingId ? 'default' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {withdrawingId === p._id ? (
                                                    <><Loader2 size={16} className="animate-spin" /> Withdrawing...</>
                                                ) : (
                                                    "Withdraw to Wallet"
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {checkpoint && !scanResult.matchedPayments?.length && (
                            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                                    Last scanned: Block {checkpoint.lastScannedBlock ?? "never"} 
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Viewing Key Modal */}
                    {showKeyModal && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}>
                            <div style={{
                                background: '#1a1a1a',
                                width: '100%',
                                maxWidth: '380px',
                                borderRadius: '24px',
                                padding: '32px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }} className="animate-slide-up">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'white' }}>Authorization</h3>
                                <p style={{ fontSize: '0.875rem', color: '#888888', marginBottom: '24px', lineHeight: 1.5 }}>
                                    Enter your <strong>Viewing Private Key</strong> to scan.
                                </p>
                                
                                <input 
                                    type="password"
                                    placeholder="0x..."
                                    value={viewPrivKey}
                                    onChange={(e) => setViewPrivKey(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        color: 'white',
                                        fontFamily: 'monospace',
                                        marginBottom: '24px'
                                    }}
                                />
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={handleScan} disabled={!viewPrivKey} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: '#ccff00', color: '#111111', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: !viewPrivKey ? 0.5 : 1 }}>Authorize</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </PageTransition>

            <MobileNav />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
