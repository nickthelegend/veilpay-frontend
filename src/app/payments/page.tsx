"use client";

import { useState, useEffect } from "react";
import { Send, QrCode, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateStealthAddress, bytesToHex } from "@/lib/stealth";
import { ethers } from "ethers";
import { CONTRACTS } from "@/lib/contracts";
import { useAnnouncementScanner } from "@/hooks/useAnnouncementScanner";

import { STEALTH_REGISTRY_ABI, STEALTH_ANNOUNCER_ABI } from "@/lib/abi";

export default function PaymentsPage() {
    const { address, isConnected } = useAccount();
    const [view, setView] = useState<"send" | "scan">("send");
    
    // Send State
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Scan State
    const [viewPrivKey, setViewPrivKey] = useState("");
    const [spendPubKey, setSpendPubKey] = useState("");
    const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
    const [showKeyModal, setShowKeyModal] = useState(false);
    const { scan, scanResult, checkpoint } = useAnnouncementScanner(address);

    const recordSent = useMutation(api.payments.recordSentPayment);
    const profile = useQuery(api.users.getProfile, address ? { walletAddress: address } : "skip");

    const { writeContractAsync } = useWriteContract();
    const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash: txHash as `0x${string}`,
    });

    const handleSend = async () => {
        if (!address || !recipient || !amount) return;
        setIsSending(true);
        console.log("🚀 Starting Shielded Payment Process...");
        console.log("📍 Sender:", address);
        console.log("📍 Recipient Input:", recipient);
        console.log("💰 Amount:", amount, "CFX");

        try {
            // 1. Resolve recipient's stealth meta-address
            let stealthMetaAddress = recipient;
            
            // If it looks like a standard wallet address (42 chars), look it up
            if (recipient.length === 42 && recipient.startsWith("0x")) {
                console.log("🔍 Detected wallet address, looking up stealth identity in registry...");
                const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
                const registry = new ethers.Contract(CONTRACTS.StealthRegistry, STEALTH_REGISTRY_ABI, provider);
                const registeredMeta: string = await registry.getStealthMetaAddress(recipient);
                
                if (!registeredMeta || registeredMeta === "0x") {
                    console.error("❌ Registry lookup failed: No stealth identity found for this wallet.");
                    throw new Error("This wallet address has not registered a stealth identity yet.");
                }
                stealthMetaAddress = registeredMeta;
                console.log("✅ Resolved Meta-Address:", stealthMetaAddress);
            } else if (stealthMetaAddress.length < 130) {
                console.error("❌ Invalid recipient format.");
                throw new Error("Invalid recipient. Please provide a wallet address or a 132-char stealth meta-address.");
            }

            // 2. Generate one-time stealth address
            console.log("🔐 Generating one-time stealth address and ephemeral keys...");
            const { stealthAddress, ephemeralPubKey } = generateStealthAddress(stealthMetaAddress);
            console.log("✨ Computed Stealth Address:", stealthAddress);
            console.log("🔑 Ephemeral PubKey:", ephemeralPubKey);

            // 3. Submit announcement + transfer on-chain via WAGMI
            console.log("📡 Requesting signature from wallet for on-chain announcement...");
            const amountWei = ethers.parseEther(amount);

            // Using wagmi writeContractAsync for better wallet integration & less timeouts
            const hash = await writeContractAsync({
                address: CONTRACTS.StealthAnnouncer as `0x${string}`,
                abi: STEALTH_ANNOUNCER_ABI,
                functionName: "sendNative",
                args: [
                    stealthAddress as `0x${string}`,
                    ephemeralPubKey as `0x${string}`,
                    "0x" as `0x${string}`, // empty metadata
                ],
                value: amountWei,
            });

            console.log("✅ Transaction Sent! Hash:", hash);
            setTxHash(hash);
            
            // 4. Record as pending in Convex immediately
            console.log("📝 Recording transaction in Convex database...");
            await recordSent({
                senderWallet: address,
                recipientStealthMetaAddress: stealthMetaAddress,
                computedStealthAddress: stealthAddress,
                ephemeralPubKey,
                amount: amountWei.toString(),
                amountFormatted: `${amount} CFX`,
                txHash: hash,
                status: "pending",
                sentAt: Date.now(),
                network: "confluxTestnet",
            });
            console.log("💾 Convex record created.");

        } catch (err: any) {
            console.error("❌ Payment Process Failed:", err);
            alert(err.message || "Send failed");
            setIsSending(false);
        }
    };

    useEffect(() => {
        if (isTxSuccess) {
            console.log("🎊 Transaction Confirmed on Conflux!");
            setIsSending(false);
            alert("Shielded Payment Sent & Confirmed!");
        }
    }, [isTxSuccess]);

    const handleScan = async () => {
        if (!viewPrivKey || !spendPubKey) return;
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
                <p style={{ color: '#888888', textAlign: 'center', marginBottom: '30px', maxWidth: '280px' }}>Connect your wallet to access stealth payments and secure scanning.</p>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            <header style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
                    Stealth <span style={{ color: '#ccff00' }}>Payments</span>
                </h1>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    {/* View Switcher */}
                    <div style={{
                        marginTop: '24px',
                        display: 'flex',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '4px',
                        marginBottom: '32px'
                    }}>
                        <button 
                            onClick={() => setView("send")}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                background: view === "send" ? "#ccff00" : "transparent",
                                color: view === "send" ? "#111111" : "#888888",
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Send
                        </button>
                        <button 
                            onClick={() => setView("scan")}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                background: view === "scan" ? "#ccff00" : "transparent",
                                color: view === "scan" ? "#111111" : "#888888",
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Scan
                        </button>
                    </div>

                    {view === "send" ? (
                        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Recipient Meta-Address</label>
                                <div style={{ position: 'relative' }}>
                                    <textarea 
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="0x..."
                                        style={{
                                            width: '100%',
                                            height: '100px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '16px',
                                            padding: '16px',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            fontFamily: 'monospace',
                                            resize: 'none'
                                        }}
                                    />
                                    <QrCode size={20} color="#ccff00" style={{ position: 'absolute', bottom: '16px', right: '16px', opacity: 0.5 }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Amount (CFX)</label>
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
                                        color: 'white',
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <button 
                                onClick={handleSend}
                                disabled={isSending || !recipient || !amount}
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
                                    opacity: (isSending || !recipient || !amount) ? 0.5 : 1
                                }}
                            >
                                {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={22} />}
                                {isSending ? "Encrypting & Sending..." : "Send Privately"}
                            </button>

                            {txHash && (
                                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '12px', border: '1px solid rgba(74, 222, 128, 0.2)', display: 'flex', gap: '12px' }}>
                                    <CheckCircle2 size={20} color="#4ade80" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4ade80' }}>Payment Dispatched</p>
                                        <a 
                                            href={`https://testnet.confluxscan.io/tx/${txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ 
                                                fontSize: '0.75rem', 
                                                color: '#888888', 
                                                marginTop: '4px',
                                                textDecoration: 'underline',
                                                display: 'block'
                                            }}
                                        >
                                            View on ConfluxScan: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                            <div style={{ background: 'var(--primary-muted)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-primary)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <Shield size={24} color="var(--primary)" />
                                    <h3 style={{ fontWeight: 700 }}>Secure Scanner</h3>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', lineHeight: 1.5 }}>
                                    Scanning detects private payments directed to you. Enter your keys below to synchronize your private vault.
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '8px' }}>Spending Public Key</label>
                                <input 
                                    type="text"
                                    value={spendPubKey}
                                    onChange={(e) => setSpendPubKey(e.target.value)}
                                    placeholder="Enter spending pubkey (0x...)"
                                    style={{
                                        width: '100%',
                                        background: 'var(--input)',
                                        border: '1px solid var(--border)',
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
                                    background: 'var(--primary)',
                                    color: 'var(--primary-foreground)',
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
                                {scanResult.isScanning ? `Scanning (${scanProgress.current}/${scanProgress.total})...` : "Scan for Payments"}
                            </button>

                            {checkpoint && (
                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                                        Last scanned: Block {checkpoint.lastScannedBlock ?? "never"} 
                                        {checkpoint.totalAnnouncements > 0 && ` • Checked ${checkpoint.totalAnnouncements} announcements`}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                                        Matched <span style={{ color: 'var(--primary)' }}>{checkpoint.matchedCount ?? 0}</span> private payments total.
                                    </p>
                                </div>
                            )}

                            {scanResult.matched > 0 && (
                                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--success-muted)', borderRadius: '12px', border: '1px solid var(--success)', display: 'flex', gap: '12px' }}>
                                    <CheckCircle2 size={20} color="var(--success)" />
                                    <div>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>Scan Complete</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '4px' }}>Found {scanResult.matched} new private payment(s)! Check your inbox.</p>
                                    </div>
                                </div>
                            )}
                            
                            {scanResult.isScanning === false && scanResult.scanned > 0 && scanResult.matched === 0 && (
                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                                        Scan complete. No new payments found                                    </p>
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
                                    background: 'var(--card)',
                                    width: '100%',
                                    maxWidth: '380px',
                                    borderRadius: '24px',
                                    padding: '32px',
                                    border: '1px solid var(--border)'
                                }} className="animate-slide-up">
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'white' }}>Final Authorization</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                                        Enter your <strong style={{ color: 'var(--primary)' }}>Viewing Private Key</strong> to decrypt announcements. This key never leaves your browser.
                                    </p>
                                    
                                    <input 
                                        type="password"
                                        placeholder="0x..."
                                        value={viewPrivKey}
                                        onChange={(e) => setViewPrivKey(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'var(--input)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '16px',
                                            padding: '16px',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            fontFamily: 'monospace',
                                            marginBottom: '24px'
                                        }}
                                    />
                                    
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button 
                                            onClick={() => setShowKeyModal(false)}
                                            style={{
                                                flex: 1,
                                                padding: '16px',
                                                borderRadius: '14px',
                                                background: 'transparent',
                                                color: 'white',
                                                border: '1px solid var(--border)',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleScan}
                                            disabled={!viewPrivKey}
                                            style={{
                                                flex: 1,
                                                padding: '16px',
                                                borderRadius: '14px',
                                                background: 'var(--primary)',
                                                color: 'var(--primary-foreground)',
                                                border: 'none',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                opacity: !viewPrivKey ? 0.5 : 1
                                            }}
                                        >
                                            Authorize
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        </>
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
