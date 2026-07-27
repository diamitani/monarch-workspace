import { describe, expect, it } from 'vitest';
import { completionRatio, isStalled, readySteps, type Plan, type PlanStep } from './plan.js';
import {
  APPROVAL_TTL_MS,
  effectiveArguments,
  isActionable,
  isExpired,
  permitsExecution,
  type Approval,
} from './approval.js';
import { decodeSSE, encodeSSE, type StreamEvent } from './events.js';
import { needsClarification, type Intent } from './intent.js';

function step(over: Partial<PlanStep> & Pick<PlanStep, 'id'>): PlanStep {
  return {
    title: 'a step',
    agent: 'researcher',
    tools: [],
    risk: 'read-only',
    dependsOn: [],
    status: 'pending',
    produces: null,
    ...over,
  };
}

function plan(steps: PlanStep[]): Plan {
  return {
    id: 'p',
    projectId: 'proj',
    intent: {} as Intent,
    steps,
    assumptions: [],
    createdAt: new Date().toISOString(),
    revision: 1,
  };
}

describe('readySteps', () => {
  it('returns steps with no dependencies', () => {
    expect(readySteps(plan([step({ id: 'a' }), step({ id: 'b' })])).map((s) => s.id)).toEqual([
      'a',
      'b',
    ]);
  });

  it('withholds a step until every dependency is done', () => {
    const p = plan([
      step({ id: 'a', status: 'done' }),
      step({ id: 'b', status: 'running' }),
      step({ id: 'c', dependsOn: ['a', 'b'] }),
    ]);
    expect(readySteps(p)).toHaveLength(0);
  });

  it('releases a step once the last dependency lands', () => {
    const p = plan([
      step({ id: 'a', status: 'done' }),
      step({ id: 'b', status: 'done' }),
      step({ id: 'c', dependsOn: ['a', 'b'] }),
    ]);
    expect(readySteps(p).map((s) => s.id)).toEqual(['c']);
  });

  it('does not treat a failed dependency as satisfied', () => {
    const p = plan([step({ id: 'a', status: 'failed' }), step({ id: 'b', dependsOn: ['a'] })]);
    expect(readySteps(p)).toHaveLength(0);
  });
});

describe('isStalled', () => {
  it('is false for a finished plan', () => {
    expect(isStalled(plan([step({ id: 'a', status: 'done' })]))).toBe(false);
  });

  it('is false while something is still running', () => {
    const p = plan([step({ id: 'a', status: 'running' }), step({ id: 'b', dependsOn: ['a'] })]);
    expect(isStalled(p)).toBe(false);
  });

  it('is true when work remains but nothing can start', () => {
    const p = plan([step({ id: 'a', status: 'failed' }), step({ id: 'b', dependsOn: ['a'] })]);
    expect(isStalled(p)).toBe(true);
  });
});

describe('completionRatio', () => {
  it('counts failed and skipped steps as settled', () => {
    const p = plan([
      step({ id: 'a', status: 'done' }),
      step({ id: 'b', status: 'skipped' }),
      step({ id: 'c', status: 'failed' }),
      step({ id: 'd', status: 'pending' }),
    ]);
    expect(completionRatio(p)).toBe(0.75);
  });

  it('reports an empty plan as complete rather than dividing by zero', () => {
    expect(completionRatio(plan([]))).toBe(1);
  });
});

describe('approvals', () => {
  const base: Approval = {
    id: 'ap1',
    projectId: 'proj',
    stepId: 's1',
    preview: {
      summary: 'Send email to dana@example.com',
      service: 'gmail',
      toolName: 'gmail_send',
      arguments: { to: 'dana@example.com', body: 'original' },
      reversal: null,
    },
    state: 'pending',
    requestedAt: new Date().toISOString(),
    decidedAt: null,
    amendedArguments: null,
  };

  it('blocks execution while still pending', () => {
    expect(permitsExecution(base)).toBe(false);
  });

  it('blocks execution when denied', () => {
    expect(permitsExecution({ ...base, state: 'denied' })).toBe(false);
  });

  it('permits execution once granted', () => {
    expect(permitsExecution({ ...base, state: 'granted' })).toBe(true);
  });

  it('blocks execution on a granted approval that has aged out', () => {
    // A stale "yes" is not consent to act now.
    const stale = {
      ...base,
      state: 'granted' as const,
      requestedAt: new Date(Date.now() - APPROVAL_TTL_MS - 1000).toISOString(),
    };
    expect(isExpired(stale)).toBe(true);
    expect(permitsExecution(stale)).toBe(false);
  });

  it('stops offering a decision on an expired request', () => {
    const stale = {
      ...base,
      requestedAt: new Date(Date.now() - APPROVAL_TTL_MS - 1000).toISOString(),
    };
    expect(isActionable(stale)).toBe(false);
  });

  it('executes the edited arguments when the person amended them', () => {
    const amended = { ...base, amendedArguments: { to: 'dana@example.com', body: 'edited' } };
    expect(effectiveArguments(amended)).toEqual({ to: 'dana@example.com', body: 'edited' });
  });

  it('falls back to the original arguments when nothing was amended', () => {
    expect(effectiveArguments(base)).toEqual({ to: 'dana@example.com', body: 'original' });
  });
});

describe('SSE encoding', () => {
  it('round-trips an event', () => {
    const event: StreamEvent = { type: 'text', stepId: 's1', delta: 'hello' };
    expect(decodeSSE(encodeSSE(event))).toEqual(event);
  });

  it('survives a delta containing newlines', () => {
    const event: StreamEvent = { type: 'text', stepId: 's1', delta: 'line one\nline two' };
    expect(decodeSSE(encodeSSE(event))).toEqual(event);
  });

  it('ignores keep-alives and terminators', () => {
    expect(decodeSSE(': keep-alive')).toBeNull();
    expect(decodeSSE('data: [DONE]')).toBeNull();
  });

  it('ignores a malformed frame instead of throwing', () => {
    expect(decodeSSE('data: {not json')).toBeNull();
  });

  it('rejects well-formed JSON that is not an event', () => {
    expect(decodeSSE('data: {"foo":1}')).toBeNull();
  });
});

describe('needsClarification', () => {
  const intent = (over: Partial<Intent>): Intent =>
    ({ ambiguityScore: 0, clarifyingQuestions: [], ...over }) as Intent;

  it('is false for a clear request', () => {
    expect(needsClarification(intent({ ambiguityScore: 0.1 }))).toBe(false);
  });

  it('is true when vague and there is something to ask', () => {
    expect(
      needsClarification(intent({ ambiguityScore: 0.9, clarifyingQuestions: ['which city?'] })),
    ).toBe(true);
  });

  it('is false when vague but there is nothing to ask', () => {
    expect(needsClarification(intent({ ambiguityScore: 0.9, clarifyingQuestions: [] }))).toBe(false);
  });
});
