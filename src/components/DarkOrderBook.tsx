"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ethers } from "ethers";
import { 
  Activity, 
  Layers, 
  Zap, 
  FileCheck,
  Search,
  ArrowUpRight
} from "lucide-react";

export default function DarkOrderBook() {
  const settlements = useQuery(api.darkpool.getRecentSettlements, { limit: 10 });
  const stats = useQuery(api.darkpool.getGlobalStats);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(1)}K`;
    return `$${vol.toFixed(2)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="#ccff00" /> Live Matches
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(204,255,0,0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(204,255,0,0.2)' }}>
          <div style={{ width: '6px', height: '6px', background: '#ccff00', borderRadius: '50%' }} className="animate-pulse" />
          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#ccff00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!settlements || settlements.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px' }}>
               <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(204,255,0,0.2)', borderRadius: '50%' }} />
               <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top right, transparent, transparent, rgba(204,255,0,0.1))', borderRadius: '50%' }} className="animate-spin-slow" />
               <Search size={24} color="#ccff00" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3 }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#555555', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Scanning Dark Pool...</p>
          </div>
        ) : (
          settlements.map((s) => (
            <div key={s._id} style={{ 
              padding: '16px', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '8px', height: '8px', background: '#ccff00', borderRadius: '50%', boxShadow: '0 0 8px #ccff00' }} />
                   <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#ccff00', textTransform: 'uppercase' }}>Settled Match</span>
                </div>
                <span style={{ fontSize: '0.625rem', color: '#555555', fontFamily: 'monospace' }}>
                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '4px', height: '4px', background: '#4ade80', borderRadius: '50%', opacity: 0.5 }} />
                      <span style={{ fontSize: '0.75rem', color: '#888888', fontFamily: 'monospace' }}>{s.commitmentA.slice(0, 12)}...</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '4px', height: '4px', background: '#3b82f6', borderRadius: '50%', opacity: 0.5 }} />
                      <span style={{ fontSize: '0.75rem', color: '#888888', fontFamily: 'monospace' }}>{s.commitmentB.slice(0, 12)}...</span>
                   </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>
                      {Number(ethers.formatUnits(s.fillAmount, 18)).toFixed(2)}
                      <span style={{ fontSize: '0.625rem', color: '#555555', marginLeft: '4px' }}>dUSDC</span>
                   </p>
                   <p style={{ fontSize: '0.75rem', color: '#ccff00', fontFamily: 'monospace' }}>
                      @ {Number(ethers.formatUnits(s.settlementPrice, 18)).toFixed(3)} CFX
                   </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(204,255,0,0.6)' }}>
                    <FileCheck size={12} />
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ZK Logic Validated</span>
                 </div>
                 <a 
                  href={`https://evmtestnet.confluxscan.io/tx/${s.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555555', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', textDecoration: 'none' }}
                 >
                   Explorer <ArrowUpRight size={10} />
                 </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Protocol Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
         <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ fontSize: '0.625rem', color: '#555555', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>Total Volume</h4>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
              {stats ? formatVolume(stats.totalVolume) : "..."}
            </p>
         </div>
         <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ fontSize: '0.625rem', color: '#555555', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>Active Nodes</h4>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: '#ccff00' }}>
              {stats ? stats.activeNodes.toLocaleString() : "..."}
            </p>
         </div>
      </div>
    </div>
  );
}
