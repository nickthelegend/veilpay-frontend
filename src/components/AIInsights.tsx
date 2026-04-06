"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sparkles, ShieldCheck, TrendingUp, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface AIResult {
  score: number;
  insights: string[];
}

export default function AIInsights() {
  const { address } = useAccount();
  const [data, setData] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const history = useQuery(api.payments.getPaymentHistory, address ? { walletAddress: address } : "skip");
  const profile = useQuery(api.users.getProfile, address ? { walletAddress: address } : "skip");

  const generateInsights = async () => {
    if (!address || !history) return;
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        body: JSON.stringify({ history, profile }),
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address && history && !data && !loading) {
      generateInsights();
    }
  }, [address, history]);

  if (!address) return null;

  return (
    <div style={{ width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Privacy Score Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--background-secondary) 0%, var(--background-tertiary) 100%)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid var(--border)',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 size={32} color="var(--primary)" className="animate-spin" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>Analyzing Private Ledger...</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Privacy Score</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', margin: 0 }}>AI Health Rating</p>
            </div>
          </div>
          <button 
            onClick={generateInsights}
            disabled={loading}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border)', 
              borderRadius: '10px', 
              padding: '8px 12px', 
              color: 'var(--primary)', 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '100px', height: '100px' }}>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="var(--border)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="var(--primary)"
                strokeWidth="8"
                strokeDasharray={`${282 * ((data?.score ?? 0) / 100)} 282`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
              {data?.score ?? ".."}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
              {data?.score && data.score > 80 ? "Premium Stealth status" : "Good, but could be better"}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)', lineHeight: 1.5 }}>
              Your financial footprint is shielded across {history?.length ?? 0} private transactions. 
            </p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={20} color="var(--primary)" />
        AI Optimization
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(data?.insights ?? ["Analyzing history...", "Validating stealth usage...", "Securing metadata..."]).map((insight, i) => (
          <div 
            key={i} 
            style={{ 
              background: 'var(--background-secondary)', 
              padding: '20px', 
              borderRadius: '20px', 
              border: '1px solid var(--border)',
              display: 'flex',
              gap: '16px',
              animation: `slideLeft 0.5s ease-out ${i * 0.1}s forwards`
            }}
          >
            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={18} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', lineHeight: 1.5 }}>{insight}</p>
            </div>
            <div style={{ alignSelf: 'center' }}>
              <ArrowRight size={16} color="var(--foreground-muted)" />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
