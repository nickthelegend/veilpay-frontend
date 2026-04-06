"use client";

import { useState, useEffect } from "react";
import { Send, QrCode, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateStealthAddress, bytesToHex, checkAnnouncement } from "@/lib/stealth";
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
    const [lastUsedViewingKey, setLastUsedViewingKey] = useState("");
    const [spendPubKey, setSpendPubKey] = useState("");
    const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
    const { scan, scanResult, checkpoint, removePayment } = useAnnouncementScanner(address);

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
                            <div style={{ background: 'rgba(204, 255, 0, 0.05)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(204, 255, 0, 0.2)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <Shield size={24} color="#ccff00" />
                                    <h3 style={{ fontWeight: 700 }}>Secure Scanner</h3>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#888888', lineHeight: 1.5 }}>
                                    Enter your keys to find private payments. 
                                    <strong> Important:</strong> To withdraw, you'll need your viewing key to decrypt and the stealth address will need a tiny bit of CFX for gas.
                                </p>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#888888', marginBottom: '8px' }}>Spending Public Key (from Registered Identity)</label>
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
                                                            console.log("🔓 Deriving stealth private key for withdrawal...");
                                                            const { matched, stealthPrivKey } = checkAnnouncement(p.ephemeralPubKey, lastUsedViewingKey, p.stealthAddress);
                                                            if (!matched || !stealthPrivKey) throw new Error("Could not derive private key");
                                                            
                                                            console.log("💸 Initiating sweep from stealth address to main wallet...");
                                                            const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
                                                            const stealthWallet = new ethers.Wallet(stealthPrivKey, provider);
                                                            
                                                            const balance = await provider.getBalance(stealthWallet.address);
                                                            // Use a safer gas price for eSpace Testnet
                                                            const feeData = await provider.getFeeData();
                                                            const gasPrice = feeData.gasPrice || ethers.parseUnits("1", "gwei");
                                                            const gasLimit = 21000n;
                                                            const gasCost = gasPrice * gasLimit;
                                                            
                                                            if (balance <= gasCost) {
                                                                throw new Error(`Insufficient funds for gas. Balance: ${ethers.formatEther(balance)} CFX, Required: ${ethers.formatEther(gasCost)} CFX. Please send a tiny bit of CFX to ${stealthWallet.address} first.`);
                                                            }

                                                            const tx = await stealthWallet.sendTransaction({
                                                                to: address,
                                                                value: balance - gasCost,
                                                                gasPrice,
                                                                gasLimit
                                                            });
                                                            
                                                            console.log("⏳ Waiting for withdrawal confirmation...", tx.hash);
                                                            await tx.wait();
                                                            
                                                            console.log("✅ Withdrawal Confirmed!");
                                                            alert(`Withdrawal Success! Funds are now in your wallet.`);
                                                            removePayment(p._id);
                                                        } catch (err: any) {
                                                            console.error("❌ Withdrawal Failed:", err);
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
                                                        <>
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Withdrawing...
                                                        </>
                                                    ) : (
                                                        "Withdraw to Wallet"
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {checkpoint && (
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
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px', color: 'white' }}>Authorization Required</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#888888', marginBottom: '24px', lineHeight: 1.5 }}>
                                        Enter your <strong>Viewing Private Key</strong> to decrypt announcements locally.
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
                                                border: '1px solid rgba(255,255,255,0.1)',
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
                                                background: '#ccff00',
                                                color: '#111111',
                                                border: 'none',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                opacity: !viewPrivKey ? 0.5 : 1
                                            }}
                                        >
                                            Authorize Scan
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
