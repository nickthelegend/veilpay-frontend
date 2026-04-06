"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Dynamic import to avoid SSR issues with WebGL
const FaultyTerminal = dynamic(() => import('@/components/FaultyTerminal'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0a0a0a'
    }} />
  )
});

export default function LandingPage() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0a0a'
    }}>
      {/* Background Animation - Slower */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      }}>
        <FaultyTerminal
          scale={1.2}
          gridMul={[2, 1]}
          digitSize={1.3}
          timeScale={0.4}
          pause={false}
          scanlineIntensity={0.5}
          glitchAmount={0.8}
          flickerAmount={0.8}
          noiseAmp={1.2}
          chromaticAberration={0}
          dither={0}
          curvature={0.05}
          tint="#4ade80"
          mouseReact
          mouseStrength={0.6}
          pageLoadAnimation
          brightness={0.6}
        />
      </div>

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center'
      }}>
        {/* Title - dalto style font */}
        <h1 style={{
          fontSize: 'clamp(3rem, 12vw, 5rem)',
          fontWeight: 700,
          color: 'white',
          marginBottom: '16px',
          letterSpacing: '-0.03em',
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          textShadow: '0 4px 30px rgba(0,0,0,0.5)'
        }}>
          VeilPay<span style={{ color: '#ccff00' }}>.</span>
        </h1>

        {/* Tagline - White text */}
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.25rem)',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '48px',
          maxWidth: '400px',
          lineHeight: 1.6
        }}>
          Round up your spending,<br />
          invest in your future privately.
        </p>

        {/* CTA Button - Click animation only */}
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button
            className="landing-cta-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 36px',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111111',
              background: 'linear-gradient(135deg, #ccff00 0%, #b8e600 100%)',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
              boxShadow: '0 4px 20px rgba(204, 255, 0, 0.3)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started
            <ArrowRight size={20} />
          </button>
        </Link>

        {/* Stats - White text */}
        <div style={{
          display: 'flex',
          gap: '48px',
          marginTop: '64px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '2.5M CFX', label: 'Invested' },
            { value: '12.4%', label: 'Avg. Return' }
          ].map((stat, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#ccff00',
                marginBottom: '4px',
                fontFamily: 'var(--font-space-grotesk), sans-serif'
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.85)'
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Text - White */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 2
      }}>
        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.6)'
        }}>
          The premier private micro-investment platform on Conflux eSpace
        </p>
      </div>
    </div>
  );
}
