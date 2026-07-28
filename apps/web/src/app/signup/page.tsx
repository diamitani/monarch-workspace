'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'loading' | 'done'>('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('loading');

    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Signup failed');
        setStep('form');
        return;
      }

      // Store token
      localStorage.setItem('monarch_token', data.data.token);
      localStorage.setItem('monarch_user', JSON.stringify(data.data.user));

      setStep('done');

      // Redirect to onboarding
      setTimeout(() => router.push('/onboarding'), 800);

    } catch {
      setError('Network error. Please try again.');
      setStep('form');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,.06) 0%, transparent 60%)',
      padding: 24,
    }}>
      <img src="/logo-mark-light.png" alt="Monarch" style={{ height: 56, marginBottom: 16, opacity: .96 }} />

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,34px)',
        fontWeight: 500, color: 'var(--text-heading)', margin: '0 0 8px',
      }}>
        Join Monarch
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-500)', marginBottom: 32, maxWidth: 360, textAlign: 'center' }}>
        Your AI workspace. Plans you approve, nothing happens without your say-so.
      </p>

      {step === 'done' ? (
        <div style={{ textAlign: 'center', animation: 'mnpop .3s var(--ease-out)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👑</div>
          <div style={{ fontSize: 18, color: 'var(--ink-100)', fontWeight: 500 }}>
            Welcome, {name.split(' ')[0]}!
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', marginTop: 6 }}>
            Setting up your workspace…
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSignup}
          style={{
            width: '100%', maxWidth: 380,
            background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: 32,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {error && (
            <div style={{
              background: 'rgba(226,96,107,.12)', border: '1px solid rgba(226,96,107,.3)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              fontSize: 14, color: 'var(--error)', marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-300)', marginBottom: 6, fontWeight: 500 }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            style={inputStyle}
          />

          <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-300)', marginBottom: 6, marginTop: 18, fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />

          <label style={{ display: 'block', fontSize: 13, color: 'var(--ink-300)', marginBottom: 6, marginTop: 18, fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={step === 'loading'}
            style={{
              width: '100%', marginTop: 24,
              background: step === 'loading' ? 'var(--navy-600)' : 'var(--gold-500)',
              color: 'var(--navy-900)', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '14px 0',
              fontSize: 16, fontWeight: 600, cursor: step === 'loading' ? 'default' : 'pointer',
            }}
          >
            {step === 'loading' ? 'Creating account…' : 'Create account'}
          </button>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--ink-500)' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--gold-400)', fontWeight: 500 }}>
              Sign in
            </a>
          </div>
        </form>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--navy-800)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--ink-050)',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'var(--font-sans)',
};

function getApiBase() {
  return ''; // Uses Next.js rewrites → proxy to backend
}
