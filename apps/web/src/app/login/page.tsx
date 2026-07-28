'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function getApiBase() {
  return ''; // Uses Next.js rewrites
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('monarch_token', data.data.token);
      localStorage.setItem('monarch_user', JSON.stringify(data.data.user));

      const next = data.nextStep === 'dashboard' ? '/dashboard' : '/onboarding';
      router.push(next);

    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
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
        fontWeight: 500, color: 'var(--text-heading)', margin: '0 0 32px',
      }}>
        Welcome back
      </h1>

      <form
        onSubmit={handleLogin}
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

        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" required style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 18 }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password" required style={inputStyle} />

        <button type="submit" disabled={loading} style={{
          width: '100%', marginTop: 24,
          background: loading ? 'var(--navy-600)' : 'var(--gold-500)',
          color: 'var(--navy-900)', border: 'none',
          borderRadius: 'var(--radius-md)', padding: '14px 0',
          fontSize: 16, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
        }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--ink-500)' }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: 'var(--gold-400)', fontWeight: 500 }}>Create one</a>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, color: 'var(--ink-300)', marginBottom: 6, fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'var(--navy-800)', border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-md)', color: 'var(--ink-050)',
  fontSize: 15, outline: 'none', fontFamily: 'var(--font-sans)',
};
