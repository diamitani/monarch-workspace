'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────

interface DashboardData {
  greeting: string;
  phase: string;
  intent: { primaryGoal?: string; domain?: string; subject?: string } | null;
  goals: string[];
  suggestedAgents: string[];
  suggestedSkills: string[];
  quickActions: string[];
}

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
}

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('monarch_token') || '';
}

// ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/signup');
      return;
    }

    // Try loading from localStorage first
    const cached = localStorage.getItem('monarch_dashboard');
    if (cached) {
      try {
        setDashboard(JSON.parse(cached));
        setLoading(false);
      } catch {}
    }

    // Fetch fresh from server
    fetch(`${getApiBase()}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.dashboard) {
          setDashboard(data.data.dashboard);
          localStorage.setItem('monarch_dashboard', JSON.stringify(data.data.dashboard));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: 'var(--navy-700)',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'var(--gold-500)', animation: 'mnblink 1.2s infinite',
            }} />
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-500)' }}>Loading your workspace…</div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-400)' }}>Unable to load dashboard.</p>
          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: 16, background: 'var(--gold-500)', color: 'var(--navy-900)',
              border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 20px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Go to workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--navy-900)',
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-mark-light.png" alt="" style={{ height: 28 }} />
          <span style={{ fontSize: 13, letterSpacing: '.22em', color: 'var(--ink-050)', fontWeight: 500 }}>
            MONARCH
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'var(--gold-500)', color: 'var(--navy-900)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Open Workspace
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px' }}>
        {/* Greeting */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 500,
          fontSize: 'clamp(26px,4vw,36px)', color: 'var(--text-heading)',
          marginBottom: 8,
        }}>
          {dashboard.greeting}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-400)', marginBottom: 40 }}>
          Your PAL engine is ready. Here's what we know about your goals.
        </p>

        {/* PAL Classification Card */}
        <div style={{
          background: 'var(--surface-card)', border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-lg)', padding: 24,
          boxShadow: 'var(--shadow-card)', marginBottom: 32,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(212,175,55,.12)', borderRadius: 'var(--radius-pill)',
            padding: '4px 12px', fontSize: 12, color: 'var(--gold-400)',
            fontWeight: 500, marginBottom: 12,
          }}>
            PAL Classified · {dashboard.phase}
          </div>

          {dashboard.intent && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 4 }}>Primary Goal</div>
              <div style={{ fontSize: 17, color: 'var(--ink-050)', fontWeight: 500 }}>
                {dashboard.intent.primaryGoal}
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-400)', marginTop: 4 }}>
                Domain: {dashboard.intent.domain} · Subject: {dashboard.intent.subject}
              </div>
            </div>
          )}

          {dashboard.goals.length > 0 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 8 }}>Your Goals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dashboard.goals.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 14, color: 'var(--ink-200)',
                  }}>
                    <span style={{ color: 'var(--gold-400)', fontSize: 12 }}>◆</span>
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Skills + Agents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
          {/* Agents */}
          <div style={{
            background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: 22,
          }}>
            <div style={{ fontSize: 13, letterSpacing: '.1em', color: 'var(--ink-500)', marginBottom: 12, textTransform: 'uppercase' }}>
              Suggested Agents
            </div>
            {dashboard.suggestedAgents.map((name) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
                fontSize: 15, color: 'var(--ink-100)',
              }}>
                <span style={{ color: 'var(--gold-400)' }}>◆</span> {name}
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{
            background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: 22,
          }}>
            <div style={{ fontSize: 13, letterSpacing: '.1em', color: 'var(--ink-500)', marginBottom: 12, textTransform: 'uppercase' }}>
              Suggested Skills
            </div>
            {dashboard.suggestedSkills.map((name) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
                fontSize: 15, color: 'var(--ink-100)',
              }}>
                <span style={{ color: 'var(--gold-400)' }}>◆</span> {name}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'var(--navy-900)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 24,
        }}>
          <div style={{ fontSize: 13, letterSpacing: '.1em', color: 'var(--ink-500)', marginBottom: 16, textTransform: 'uppercase' }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {dashboard.quickActions.map((action) => (
              <button
                key={action}
                onClick={() => {
                  if (action === 'Start a new chat') router.push('/');
                  else if (action === 'Browse skills') router.push('/?view=skills');
                  else if (action === 'Explore agents') router.push('/?view=agents');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--ink-200)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--blue-300)';
                  e.currentTarget.style.color = 'var(--blue-200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.color = 'var(--ink-200)';
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
