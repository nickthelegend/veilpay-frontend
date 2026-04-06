"use client";

import { Sparkles, TrendingUp, Target, Calendar } from "lucide-react";
import Link from "next/link";

interface AIInsightWidgetProps {
  yearEndProjection?: number;
  insightCount?: number;
  hasRecommendation?: boolean;
  compact?: boolean;
}

export default function AIInsightWidget({
  yearEndProjection = 38450,
  insightCount = 5,
  hasRecommendation = true,
  compact = false
}: AIInsightWidgetProps) {
  if (compact) {
    return (
      <Link href="/ai-insights" style={{ textDecoration: 'none' }}>
        <div style={{
          background: '#1a1a1a',
          border: '2px solid #ccff00',
          borderRadius: '16px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(204, 255, 0, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="#ccff00" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '2px', color: '#ffffff' }}>
                AI Guide
              </p>
              <p style={{ fontSize: '0.75rem', color: '#888888' }}>
                {insightCount} new recommendations
              </p>
            </div>
            <TrendingUp size={18} color="#ccff00" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/ai-insights" style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#1a1a1a',
        border: '2px solid #ccff00',
        borderRadius: '20px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(204, 255, 0, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={24} color="#ccff00" />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '1.125rem', color: '#ffffff', marginBottom: '2px' }}>AI Guide</h3>
              <p style={{ fontSize: '0.75rem', color: '#888888' }}>Personal Finance Insights</p>
            </div>
          </div>
          <TrendingUp size={20} color="#ccff00" />
        </div>
        
        <p style={{ fontSize: '0.875rem', color: '#cccccc', marginBottom: '12px', lineHeight: '1.5' }}>
          I've analyzed your spending habits. You could save up to{' '}
          <strong style={{ color: '#ccff00' }}>${yearEndProjection.toLocaleString('en-US')}</strong> by the end of the year.
        </p>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#ffffff'
          }}>
            <Target size={12} />
            {insightCount} new tips
          </span>
          {hasRecommendation && (
            <span style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#ffffff'
            }}>
              <Calendar size={12} />
              Investment growth
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
