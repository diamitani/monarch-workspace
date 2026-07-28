'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice';
  options?: string[];
}

interface ClassificationResult {
  phase: string;
  phaseLabel: string;
  phaseDescription: string;
  intent: { primaryGoal: string; domain: string; subject: string };
  confidence: number;
  questions: OnboardingQuestion[];
}

type Step = 'goal' | 'classifying' | 'questions' | 'completing' | 'done';

// ─────────────────────────────────────────────────────────────

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
}

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('monarch_token') || '';
}

// ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState('');
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase descriptions for the classifying animation
  const phaseHints = [
    'Understanding what you want to do…',
    'Finding the best approach…',
    'Matching the right tools…',
    'Mapping out the path ahead…',
  ];

  const handleClassify = async () => {
    if (!goal.trim()) return;
    setError('');
    setStep('classifying');

    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/onboarding/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ goal }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Classification failed');
        setStep('goal');
        return;
      }

      setClassification(data.data);
      // Small delay for the animation
      setTimeout(() => setStep('questions'), 1200);

    } catch {
      setError('Network error. Please try again.');
      setStep('goal');
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ preferences: answers }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Failed to complete setup');
          setIsSubmitting(false);
        return;
      }

      // Store dashboard data
      if (data.data.dashboard) {
        localStorage.setItem('monarch_dashboard', JSON.stringify(data.data.dashboard));
      }
      localStorage.setItem('monarch_onboarding_complete', 'true');

      setStep('done');
      setTimeout(() => router.push('/dashboard'), 1000);

    } catch {
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const allAnswered = classification
    ? classification.questions.every((q) => answers[q.id]?.trim())
    : false;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Progress indicator */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 48, alignItems: 'center',
      }}>
        {['goal', 'classifying', 'questions', 'completing'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: stepOrder(s) <= stepOrder(step) ? 32 : 24,
              height: stepOrder(s) <= stepOrder(step) ? 32 : 24,
              borderRadius: '50%',
              background: stepOrder(s) < stepOrder(step) ? 'var(--success)'
                : stepOrder(s) === stepOrder(step) ? 'var(--gold-500)' : 'var(--navy-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600,
              color: stepOrder(s) <= stepOrder(step) ? 'var(--navy-900)' : 'var(--ink-500)',
              transition: 'all .3s var(--ease-out)',
            }}>
              {stepOrder(s) < stepOrder(step) ? '✓' : i + 1}
            </div>
            {i < 3 && (
              <div style={{
                width: 40, height: 2,
                background: stepOrder(s) < stepOrder(step) ? 'var(--success)' : 'var(--navy-700)',
                transition: 'all .3s var(--ease-out)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step: Goal */}
      {step === 'goal' && (
        <div style={{ maxWidth: 560, width: '100%', animation: 'mnfade .3s var(--ease-out)', textAlign: 'center' }}>
          <img src="/logo-mark-light.png" alt="" style={{ height: 44, opacity: .8, marginBottom: 24 }} />
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 'clamp(24px,4vw,32px)', color: 'var(--text-heading)',
            margin: '0 0 12px',
          }}>
            What brings you to Monarch?
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-500)', marginBottom: 28, lineHeight: 1.5 }}>
            Describe what you want to accomplish in your own words.
            Hermes will figure out the best way to help.
          </p>

          {error && (
            <div style={{
              background: 'rgba(226,96,107,.12)', border: '1px solid rgba(226,96,107,.3)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              fontSize: 14, color: 'var(--error)', marginBottom: 16, textAlign: 'left',
            }}>
              {error}
            </div>
          )}

          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., I want to build a website for my photography business, plan a move to Chicago, or organize my family's finances…"
            rows={4}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'var(--surface-card)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)', color: 'var(--ink-050)',
              fontSize: 16, lineHeight: 1.5, outline: 'none', resize: 'none',
              fontFamily: 'var(--font-sans)', boxShadow: 'var(--shadow-card)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && goal.trim()) {
                e.preventDefault();
                handleClassify();
              }
            }}
          />

          <button
            onClick={handleClassify}
            disabled={!goal.trim()}
            style={{
              marginTop: 20, padding: '14px 36px',
              background: goal.trim() ? 'var(--gold-500)' : 'var(--navy-700)',
              color: goal.trim() ? 'var(--navy-900)' : 'var(--ink-500)',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 16, fontWeight: 600, cursor: goal.trim() ? 'pointer' : 'default',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Let Hermes figure it out →
          </button>
        </div>
      )}

      {/* Step: Classifying (loading animation) */}
      {step === 'classifying' && (
        <div style={{
          maxWidth: 480, width: '100%', textAlign: 'center',
          animation: 'mnfade .3s var(--ease-out)',
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--navy-700)', margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%',
                background: 'var(--gold-500)', animation: 'mnblink 1.2s infinite',
              }} />
            </div>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 22, color: 'var(--text-heading)', marginBottom: 16,
          }}>
            Thinking about your goal…
          </h2>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {phaseHints.map((hint, i) => (
              <span key={i} style={{
                fontSize: 13, color: 'var(--ink-500)',
                animation: `mnfade .4s var(--ease-out) ${i * .3}s both`,
              }}>
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step: Questions */}
      {step === 'questions' && classification && (
        <div style={{
          maxWidth: 520, width: '100%', animation: 'mnfade .3s var(--ease-out)',
        }}>
          {/* PAL Classification Result */}
          <div style={{
            background: 'var(--surface-card)', border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            marginBottom: 32, boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(212,175,55,.12)', borderRadius: 'var(--radius-pill)',
              padding: '4px 12px', fontSize: 12, color: 'var(--gold-400)',
              fontWeight: 500, marginBottom: 10,
            }}>
              PAL classified · Phase: {classification.phaseLabel}
            </div>
            <p style={{ fontSize: 15, color: 'var(--ink-300)', lineHeight: 1.55, margin: 0 }}>
              {classification.phaseDescription}
            </p>
          </div>

          {/* Questions */}
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 22, color: 'var(--text-heading)', marginBottom: 6,
          }}>
            A few questions to get started
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 24 }}>
            This helps Hermes set things up just right for you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {classification.questions.map((q) => (
              <div key={q.id} style={{ animation: 'mnfade .3s var(--ease-out)' }}>
                <label style={{
                  display: 'block', fontSize: 14, fontWeight: 500,
                  color: 'var(--ink-100)', marginBottom: 8,
                }}>
                  {q.question}
                </label>
                {q.type === 'choice' && q.options ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(q.id, opt)}
                        style={{
                          padding: '8px 16px',
                          background: answers[q.id] === opt ? 'rgba(212,175,55,.12)' : 'transparent',
                          border: answers[q.id] === opt
                            ? '1px solid var(--border-gold)'
                            : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-pill)',
                          color: answers[q.id] === opt ? 'var(--gold-400)' : 'var(--ink-300)',
                          fontSize: 14, fontWeight: 500, cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    placeholder="Type your answer…"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--navy-800)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--ink-050)',
                      fontSize: 15, outline: 'none',
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleComplete}
            disabled={!allAnswered || isSubmitting}
            style={{
              width: '100%', marginTop: 28,
              padding: '14px 0',
              background: allAnswered ? 'var(--gold-500)' : 'var(--navy-700)',
              color: allAnswered ? 'var(--navy-900)' : 'var(--ink-500)',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 16, fontWeight: 600,
              cursor: allAnswered ? 'pointer' : 'default',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {isSubmitting ? 'Setting up…' : 'Complete setup →'}
          </button>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div style={{ textAlign: 'center', animation: 'mnpop .3s var(--ease-out)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 28, color: 'var(--text-heading)', marginBottom: 8,
          }}>
            Your workspace is ready
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-500)' }}>
            Taking you to your dashboard…
          </p>
        </div>
      )}
    </div>
  );
}

function stepOrder(step: Step | string): number {
  const order: Record<string, number> = {
    'goal': 0, 'classifying': 1, 'questions': 2, 'completing': 3, 'done': 4,
  };
  return order[step] ?? -1;
}
