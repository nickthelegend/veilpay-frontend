"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { CONFLUX_ESPACE_TESTNET } from "@/lib/contracts";

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== CONFLUX_ESPACE_TESTNET.id;

  if (isWrongNetwork) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(204, 255, 0, 0.95)',
        color: '#111111',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(0,0,0,0.1)',
        animation: 'slideDown 0.4s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            Wrong Network: Please switch to Conflux eSpace Testnet
          </p>
        </div>
        <button
          onClick={() => switchChain({ chainId: CONFLUX_ESPACE_TESTNET.id })}
          disabled={isPending}
          style={{
            background: '#111111',
            color: '#ccff00',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '20px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          {isPending ? "Switching..." : "Switch to Conflux"}
        </button>
        <style jsx>{`
          @keyframes slideDown {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
