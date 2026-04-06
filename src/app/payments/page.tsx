"use client";

import { useState, useEffect } from "react";
import { Send, QrCode, Shield, CheckCircle2, Loader2 } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateStealthAddress } from "@/lib/stealth";
import { ethers } from "ethers";
import { CONTRACTS } from "@/lib/contracts";

import { STEALTH_REGISTRY_ABI, STEALTH_ANNOUNCER_ABI } from "@/lib/abi";

export default function PaymentsPage() {
    const { address, isConnected } = useAccount();
    
    // Send State
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

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

        try {
            // 1. Resolve recipient's stealth meta-address
            let stealthMetaAddress = recipient;
            
            if (recipient.length === 42 && recipient.startsWith("0x")) {
                console.log("🔍 Looking up stealth identity...");
                const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
                const registry = new ethers.Contract(CONTRACTS.StealthRegistry, STEALTH_REGISTRY_ABI, provider);
                const registeredMeta: string = await registry.getStealthMetaAddress(recipient);
                
                if (!registeredMeta || registeredMeta === "0x") {
                    throw new Error("This wallet address has not registered a stealth identity yet.");
                }
                stealthMetaAddress = registeredMeta;
            }

            // 2. Generate one-time stealth address
            const { stealthAddress, ephemeralPubKey } = generateStealthAddress(stealthMetaAddress);

            // 3. Submit announcement on-chain
            const amountWei = ethers.parseEther(amount);
            const hash = await writeContractAsync({
                address: CONTRACTS.StealthAnnouncer as `0x${string}`,
                abi: STEALTH_ANNOUNCER_ABI,
                functionName: "sendNative",
                args: [
                    stealthAddress as `0x${string}`,
                    ephemeralPubKey as `0x${string}`,
                    "0x" as `0x${string}`,
                ],
                value: amountWei,
            });

            console.log("✅ Transaction Sent! Hash:", hash);
            setTxHash(hash);
            
            // 4. Record in Convex
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

        } catch (err: any) {
            console.error("❌ Send failed:", err);
            alert(err.message || "Send failed");
            setIsSending(false);
        }
    };

    useEffect(() => {
        if (isTxSuccess) {
            setIsSending(false);
            alert("Shielded Payment Sent & Confirmed!");
            setRecipient("");
            setAmount("");
        }
    }, [isTxSuccess]);

    if (!isConnected) {
        return (
            <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', padding: '20px' }}>
                <Shield size={64} color="#ccff00" style={{ marginBottom: '24px', opacity: 0.2 }} />
                <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 700 }}>Private Vault Locked</h2>
                <p style={{ color: '#888888', textAlign: 'center', marginBottom: '30px', maxWidth: '280px' }}>Connect your wallet to send shielded payments.</p>
                <MobileNav />
            </div>
        );
    }

    return (
        <div className="mobile-container" style={{ background: '#111111', minHeight: '100vh', paddingBottom: '100px', color: '#ffffff' }}>
            <header style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-space-grotesk)' }}>
                    Send <span style={{ color: '#ccff00' }}>Privately</span>
                </h1>
            </header>

            <PageTransition>
                <main style={{ padding: '0 20px', maxWidth: '430px', margin: '0 auto' }}>
                    <div style={{ animation: 'fadeIn 0.3s ease-in', marginTop: '24px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Recipient (Address or Meta-Address)</label>
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
                            {isSending ? "Encrypting & Sending..." : "Send Shielded Payment"}
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
                                        style={{ fontSize: '0.75rem', color: '#888888', marginTop: '4px', textDecoration: 'underline', display: 'block' }}
                                    >
                                        View on ConfluxScan
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
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
