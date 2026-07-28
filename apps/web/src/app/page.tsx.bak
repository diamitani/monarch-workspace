'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  Shield,
  Layers,
  GitBranch,
  CheckCircle,
  Bot,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Design System
// ─────────────────────────────────────────────────────────────

const Logo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="8" fill="#C6A247" />
    <path
      d="M20 8L28 14V26L20 32L12 26V14L20 8Z"
      stroke="#0A1730"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="20" cy="20" r="4" fill="#0A1730" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(198,162,71,0.08) 0%, transparent 60%)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          background: 'rgba(198,162,71,0.1)',
          border: '1px solid rgba(198,162,71,0.3)',
          borderRadius: 100,
          marginBottom: 32,
        }}
      >
        <Sparkles size={14} color="var(--gold-400)" />
        <span style={{ fontSize: 13, color: 'var(--gold-400)', fontWeight: 500 }}>
          Powered by ROSTR Framework
        </span>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 8vw, 72px)',
          fontWeight: 500,
          lineHeight: 1.1,
          color: 'var(--ink-050)',
          maxWidth: 900,
          margin: '0 0 24px',
        }}
      >
        The AI workspace that{' '}
        <span style={{ color: 'var(--gold-400)' }}>thinks before it builds</span>
      </h1>

      <p
        style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'var(--ink-400)',
          maxWidth: 640,
          lineHeight: 1.6,
          margin: '0 0 40px',
        }}
      >
        Monarch uses phase-aware orchestration to help you research, design, build, deploy, and
        debug — with plans you approve before execution.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: 'var(--gold-500)',
            color: 'var(--navy-900)',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open Workspace
          <ArrowRight size={18} />
        </Link>
        <a
          href="#features"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: 'transparent',
            color: 'var(--ink-200)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          See how it works
        </a>
      </div>

      {/* Terminal preview */}
      <div
        style={{
          marginTop: 80,
          background: 'var(--navy-800)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          overflow: 'hidden',
          maxWidth: 800,
          width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--navy-900)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 8,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.8 }}>
          <div style={{ color: 'var(--ink-500)' }}>$ monarch chat</div>
          <div style={{ color: 'var(--gold-400)', marginTop: 8 }}>
            &gt; Build me a user authentication system
          </div>
          <div style={{ color: 'var(--ink-300)', marginTop: 16 }}>
            <span style={{ color: 'var(--blue-400)' }}>Phase detected:</span> Development
          </div>
          <div style={{ color: 'var(--ink-300)', marginTop: 4 }}>
            <span style={{ color: 'var(--blue-400)' }}>Creating plan...</span>
          </div>
          <div style={{ marginTop: 16, color: 'var(--ink-200)' }}>
            ✓ Step 1: Set up authentication provider
            <br />
            ✓ Step 2: Create user model and migrations
            <br />○ Step 3: Implement login/signup flows
            <br />
            <span style={{ color: 'var(--gold-400)' }}>⚠ Step 4: Deploy to staging</span>{' '}
            <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>(requires approval)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Features Section
// ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Layers size={24} />,
    title: '5D Phase Taxonomy',
    description:
      'Pre-Development → Design → Development → Deployment → Debugging. Every task is classified into the right phase for appropriate handling.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Plan Approval Workflow',
    description:
      'Review and approve plans before execution. Consequential actions require explicit permission — no surprises.',
  },
  {
    icon: <GitBranch size={24} />,
    title: 'ROSTR Framework',
    description:
      'Runtime, Orchestration, State, Tools, Reference — a unified architecture for production-grade multi-agent systems.',
  },
  {
    icon: <Zap size={24} />,
    title: 'PAL Intent Compiler',
    description:
      'Your requests are compiled through a 5-stage Prompt Abstraction Layer that extracts intent, injects context, and routes to the right agent.',
  },
  {
    icon: <Bot size={24} />,
    title: 'Specialized Agents',
    description:
      'Researcher, Planner, Builder, Deployer, Debugger — each agent is optimized for its phase and knows when to hand off.',
  },
  {
    icon: <CheckCircle size={24} />,
    title: 'Knowledge Compounding',
    description:
      'Decisions, learnings, and artifacts persist to your Reference Hub. Every session builds on the last.',
  },
];

function Features() {
  return (
    <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            color: 'var(--ink-050)',
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          Built for how engineers actually work
        </h2>
        <p style={{ fontSize: 18, color: 'var(--ink-400)', maxWidth: 600, margin: '0 auto' }}>
          Not another chatbot. A phase-aware workspace that understands your workflow.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}
      >
        {features.map((feature, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: 28,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(198,162,71,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-400)',
                marginBottom: 20,
              }}
            >
              {feature.icon}
            </div>
            <h3
              style={{
                fontSize: 18,
                color: 'var(--ink-050)',
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {feature.title}
            </h3>
            <p style={{ fontSize: 15, color: 'var(--ink-400)', lineHeight: 1.6 }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Phases Section
// ─────────────────────────────────────────────────────────────

const phases = [
  {
    name: 'PreD',
    title: 'Pre-Development',
    question: 'Is this worth building?',
    color: '#8B5CF6',
    activities: ['Problem validation', 'Competitive research', 'Feasibility analysis', 'Go/no-go decision'],
  },
  {
    name: 'Design',
    title: 'Design',
    question: 'What exactly are we building?',
    color: '#60A5FA',
    activities: ['Architecture design', 'Data modeling', 'API contracts', 'User flows'],
  },
  {
    name: 'Dev',
    title: 'Development',
    question: 'Does it work?',
    color: '#34D399',
    activities: ['Implementation', 'Testing', 'Code review', 'Documentation'],
  },
  {
    name: 'Deploy',
    title: 'Deployment',
    question: 'Is it safe to ship?',
    color: '#F59E0B',
    activities: ['CI/CD pipeline', 'Staging QA', 'Production deploy', 'Monitoring'],
  },
  {
    name: 'Debug',
    title: 'Debugging',
    question: 'What broke and why?',
    color: '#EF4444',
    activities: ['Bug reproduction', 'Root cause analysis', 'Fix implementation', 'Post-mortem'],
  },
];

function Phases() {
  return (
    <section
      style={{
        padding: '100px 24px',
        background: 'var(--navy-900)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              color: 'var(--ink-050)',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            5D Phase Taxonomy
          </h2>
          <p style={{ fontSize: 18, color: 'var(--ink-400)', maxWidth: 600, margin: '0 auto' }}>
            Every task is classified into one of five phases. Each phase has its own question to
            answer and agent behavior.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {phases.map((phase, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 6,
                  background: phase.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 32 }}>
                <div style={{ minWidth: 100 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: phase.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Phase {i}
                  </span>
                  <div style={{ fontSize: 18, color: 'var(--ink-050)', fontWeight: 500, marginTop: 4 }}>
                    {phase.title}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: 'var(--ink-300)', fontStyle: 'italic' }}>
                    "{phase.question}"
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {phase.activities.map((activity, j) => (
                    <span
                      key={j}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--navy-800)',
                        borderRadius: 100,
                        fontSize: 12,
                        color: 'var(--ink-400)',
                      }}
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CTA Section
// ─────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section style={{ padding: '100px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Logo size={56} />
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            color: 'var(--ink-050)',
            fontWeight: 500,
            margin: '24px 0 16px',
          }}
        >
          Ready to work smarter?
        </h2>
        <p style={{ fontSize: 17, color: 'var(--ink-400)', marginBottom: 32, lineHeight: 1.6 }}>
          Stop wrestling with AI that doesn't understand your workflow. Monarch thinks before it
          builds, asks before it acts, and learns as it goes.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 32px',
            background: 'var(--gold-500)',
            color: 'var(--navy-900)',
            borderRadius: 8,
            fontSize: 17,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open Workspace
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────

function Header() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 24px',
        background: 'rgba(10, 23, 48, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <span
            style={{
              fontSize: 14,
              letterSpacing: '0.25em',
              color: 'var(--ink-100)',
              fontWeight: 500,
            }}
          >
            MONARCH
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a
            href="#features"
            style={{ fontSize: 14, color: 'var(--ink-300)', textDecoration: 'none' }}
          >
            Features
          </a>
          <a href="#" style={{ fontSize: 14, color: 'var(--ink-300)', textDecoration: 'none' }}>
            Docs
          </a>
          <a href="#" style={{ fontSize: 14, color: 'var(--ink-300)', textDecoration: 'none' }}>
            Pricing
          </a>
          <Link
            href="/"
            style={{
              padding: '8px 16px',
              background: 'var(--gold-500)',
              color: 'var(--navy-900)',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Launch App
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        padding: '48px 24px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--navy-900)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={24} />
          <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>
            © 2026 Monarch. Built with ROSTR Framework.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#" style={{ fontSize: 13, color: 'var(--ink-400)', textDecoration: 'none' }}>
            Privacy
          </a>
          <a href="#" style={{ fontSize: 13, color: 'var(--ink-400)', textDecoration: 'none' }}>
            Terms
          </a>
          <a href="#" style={{ fontSize: 13, color: 'var(--ink-400)', textDecoration: 'none' }}>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function MarketingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-bg)',
        color: 'var(--ink-300)',
      }}
    >
      <Header />
      <main style={{ paddingTop: 64 }}>
        <Hero />
        <Features />
        <Phases />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
