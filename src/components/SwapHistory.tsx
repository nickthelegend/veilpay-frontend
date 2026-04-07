"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAccount } from "wagmi";
import { 
  CheckCircle2, 
  CircleDashed, 
  XCircle, 
  Clock, 
  History
} from "lucide-react";

export default function SwapHistory() {
  const { address } = useAccount();
  const orders = useQuery(api.darkpool.getUserOrders, 
    address ? { owner: address } : "skip"
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CircleDashed size={14} color="#ccff00" className="animate-spin-slow" />;
      case "partially_filled": return <CircleDashed size={14} color="#ccff00" />;
      case "filled": return <CheckCircle2 size={14} color="#4ade80" />;
      case "cancelled": return <XCircle size={14} color="#ef4444" />;
      default: return <Clock size={14} color="#555555" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <History size={20} color="#888888" /> Order History
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!orders || orders.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', opacity: 0.3 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No active private orders</p>
          </div>
        ) : (
          orders.map((o) => (
            <div key={o._id} style={{ 
              padding: '16px', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   {getStatusIcon(o.status)}
                   <span style={{ fontSize: '0.625rem', fontWeight: 800, color: o.status === 'active' ? '#ccff00' : '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {o.status.replace('_', ' ')}
                   </span>
                </div>
                <span style={{ fontSize: '0.625rem', color: '#555555', fontFamily: 'monospace' }}>
                   {Math.floor((Date.now() - o.createdAt) / 1000 / 60)}m ago
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '32px', height: '32px', background: 'rgba(204,255,0,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(204,255,0,0.1)' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: 900, color: '#ccff00' }}>ZK</span>
                   </div>
                   <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>dUSDC / CFX</p>
                      <p style={{ fontSize: '0.625rem', color: o.side === 'buy' ? '#4ade80' : '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>{o.side} Order</p>
                   </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff' }}>{Number(o.amount).toLocaleString()} <span style={{ fontSize: '0.625rem', color: '#555555' }}>dUSDC</span></p>
                   <p style={{ fontSize: '0.75rem', color: '#888888', fontFamily: 'monospace' }}>@ {Number(o.price).toFixed(3)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
