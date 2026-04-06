"use client";

import { useState } from "react";
import { Send, QrCode, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { useAccount } from "wagmi";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { deriveStealthAddress, hexToBytes, bytesToHex } from "@/lib/stealth";
import { ethers } from "ethers";
import { STEALTH_ANNOUNCER_ADDRESS, CONTRACTS } from "@/lib/contracts";
import { useAnnouncementScanner } from "@/hooks/useAnnouncementScanner";

const ANNOUNCER_ABI = [
  "function sendNative(uint256 schemeId, address stealthAddress, bytes ephemeralPubKey, bytes metadata) payable",
  "function registerStealthMetaAddress(uint256 schemeId, bytes spendingPubKey, bytes viewingPubKey)"
];

const REGISTRY_ABI = [
  "function registerStealthMetaAddress(uint256 schemeId, bytes spendingPubKey, bytes viewingPubKey)",
  "function getStealthMetaAddress(address registrant, uint256 schemeId) view returns (bytes)"
];

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
    const { scan, scanResult, checkpoint } = useAnnouncementScanner(address);

    const recordSent = useMutation(api.payments.recordSentPayment);
    const profile = useQuery(api.users.getProfile, address ? { walletAddress: address } : "skip");

    const handleSend = async () => {
        if (!address || !recipient || !amount) return;
        setIsSending(true);
        try {
            // Recipient 'recipient' is a stealth meta-address (hex)
            // Parse spending and viewing keys from meta-address (66 bytes = 132 hex chars)
            const metaAddress = recipient.startsWith("0x") ? recipient.slice(2) : recipient;
            if (metaAddress.length < 132) throw new Error("Invalid meta-address length");
            
            const spendingPubKey = hexToBytes(metaAddress.slice(0, 66));
            const viewingPubKey = hexToBytes(metaAddress.slice(66, 132));

            // Derive stealth address
            const { address: stealthAddr, ephemeralPubkey: R } = deriveStealthAddress(spendingPubKey, viewingPubKey);

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const announcer = new ethers.Contract(STEALTH_ANNOUNCER_ADDRESS, ANNOUNCER_ABI, signer);

            const value = ethers.parseEther(amount);
            const tx = await announcer.sendNative(
                1, // schemeId
                stealthAddr,
                R,
                "0x", // empty metadata for native CFX
                { value }
            );

            setTxHash(tx.hash);
            
            await recordSent({
                senderWallet: address,
                recipientStealthMetaAddress: recipient,
                computedStealthAddress: stealthAddr,
                ephemeralPubKey: bytesToHex(R),
                amount: value.toString(),
                amountFormatted: `${amount} CFX`,
                txHash: tx.hash,
                status: "pending",
                sentAt: Date.now(),
                network: "confluxTestnet",
            });

            await tx.wait();
            setIsSending(false);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Send failed");
            setIsSending(false);
        }
    };

    const handleScan = async () => {
        if (!viewPrivKey || !spendPubKey) return;
        try {
            await scan(viewPrivKey, spendPubKey);
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
                                    <div>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4ade80' }}>Payment Dispatched</p>
                                        <p style={{ fontSize: '0.75rem', color: '#888888', marginTop: '4px' }}>Tx: {txHash.slice(0, 20)}...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                            <div style={{ background: 'rgba(204, 255, 0, 0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(204, 255, 0, 0.1)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <Shield size={24} color="#ccff00" />
                                    <h3 style={{ fontWeight: 700 }}>Secure Scanner</h3>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#999999', lineHeight: 1.5 }}>
                                    Your viewing key is used to decrypt incoming payments directed to your stealth addresses. Scanning happens entirely in your browser.
                                </p>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Viewing Private Key (Keep secret!)</label>
                                <input 
                                    type="password"
                                    value={viewPrivKey}
                                    onChange={(e) => setViewPrivKey(e.target.value)}
                                    placeholder="Enter your viewing secret (hex)"
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

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Spending Public Key (Required for derivation)</label>
                                <input 
                                    type="text"
                                    value={spendPubKey}
                                    onChange={(e) => setSpendPubKey(e.target.value)}
                                    placeholder="Enter your spending pubkey (hex)"
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
                                onClick={handleScan}
                                disabled={scanResult.isScanning || !viewPrivKey || !spendPubKey}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    borderRadius: '16px',
                                    background: 'white',
                                    color: '#111111',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '1.0625rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    opacity: (scanResult.isScanning || !viewPrivKey || !spendPubKey) ? 0.5 : 1
                                }}
                            >
                                {scanResult.isScanning ? <Loader2 size={24} className="animate-spin" /> : <QrCode size={22} />}
                                {scanResult.isScanning ? "Scanning Chain..." : "Scan for Payments"}
                            </button>

                            {checkpoint && (
                                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#666666' }}>
                                        Last scanned up to block: <span style={{ color: '#888888' }}>{checkpoint.lastScannedBlock}</span>
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#666666', marginTop: '4px' }}>
                                        Matched <span style={{ color: '#ccff00' }}>{checkpoint.matchedCount}</span> payments so far.
                                    </p>
                                </div>
                            )}

                            {scanResult.matched > 0 && (
                                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(204, 255, 0, 0.1)', borderRadius: '12px', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', gap: '12px' }}>
                                    <CheckCircle2 size={20} color="#ccff00" />
                                    <div>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ccff00' }}>Scan Complete</p>
                                        <p style={{ fontSize: '0.75rem', color: '#888888', marginTop: '4px' }}>Found {scanResult.matched} new payments!</p>
                                    </div>
                                </div>
                            )}
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
