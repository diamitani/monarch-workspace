import { describe, expect, it } from 'vitest';
import { CompilationError, isStalled, readySteps, type Plan } from '@monarch/shared';
import { PalCompiler, buildExtractInput } from './compiler.js';
import { parseJsonBlock, type JsonModel } from './model.js';
import { validateIntent, validatePlanBody } from './validate.js';

/** Returns each queued reply in turn, so a test can script extract-then-plan. */
function scriptedModel(...replies: unknown[]): JsonModel {
  let i = 0;
  return {
    completeJson: async () => {
      if (i >= replies.length) throw new Error('model called more times than scripted');
      return replies[i++];
    },
  };
}

const CLEAR_INTENT = {
  objective: 'plan a move to Chicago',
  domain: 'life-admin',
  subject: 'Chicago relocation',
  constraints: ['budget under $2500/mo'],
  successCriteria: ['a timeline I can follow', 'three neighborhoods compared'],
  deadline: null,
  ambiguityScore: 0.1,
  clarifyingQuestions: [],
};

const RESEARCH_STEP = {
  id: 's1',
  title: 'Compare three neighborhoods on rent and commute',
  agent: 'researcher',
  tools: ['web_search'],
  risk: 'read-only',
  dependsOn: [],
  produces: 'brief',
};

const PLANNING_STEP = {
  id: 's2',
  title: 'Build a week-by-week moving timeline',
  agent: 'planner',
  tools: [],
  risk: 'read-only',
  dependsOn: ['s1'],
  produces: 'plan',
};

const SIMPLE_PLAN = {
  assumptions: ['You are moving alone'],
  steps: [RESEARCH_STEP, PLANNING_STEP],
};

describe('PalCompiler', () => {
  it('produces a plan when the request is clear', async () => {
    const compiler = new PalCompiler(scriptedModel(CLEAR_INTENT, SIMPLE_PLAN));
    const result = await compiler.compile({ projectId: 'p1', message: 'help me move to Chicago' });

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.plan.steps).toHaveLength(2);
    expect(result.plan.projectId).toBe('p1');
    expect(result.plan.revision).toBe(1);
    expect(result.plan.assumptions).toEqual(['You are moving alone']);
  });

  it('asks instead of planning when intent is too vague', async () => {
    // Only one reply is scripted — a second model call would throw, which
    // proves the planning pass never ran.
    const compiler = new PalCompiler(
      scriptedModel({
        ...CLEAR_INTENT,
        ambiguityScore: 0.9,
        clarifyingQuestions: ['Which city are you moving to?'],
      }),
    );
    const result = await compiler.compile({ projectId: 'p1', message: 'help me move' });

    expect(result.kind).toBe('clarify');
    if (result.kind !== 'clarify') return;
    expect(result.questions).toEqual(['Which city are you moving to?']);
  });

  it('plans anyway when a request scores high but asks nothing', async () => {
    // A high score with no questions cannot be surfaced as a clarify — there
    // would be nothing to show the person — so it must fall through to planning.
    const compiler = new PalCompiler(
      scriptedModel({ ...CLEAR_INTENT, ambiguityScore: 0.95, clarifyingQuestions: [] }, SIMPLE_PLAN),
    );
    expect((await compiler.compile({ projectId: 'p1', message: 'something' })).kind).toBe('plan');
  });

  it('surfaces malformed model output as a compilation error', async () => {
    const compiler = new PalCompiler(scriptedModel({ objective: '' }));
    await expect(compiler.compile({ projectId: 'p1', message: 'x' })).rejects.toThrow(
      CompilationError,
    );
  });
});

describe('buildExtractInput', () => {
  it('truncates long attachments so one upload cannot flood the prompt', () => {
    const input = buildExtractInput({
      projectId: 'p1',
      message: 'summarize this',
      attachments: [{ name: 'notes.txt', text: 'x'.repeat(10_000) }],
    });

    expect(input).toContain('[…truncated]');
    expect(input.length).toBeLessThan(6000);
  });

  it('puts the current request last so it is the freshest context', () => {
    const input = buildExtractInput({
      projectId: 'p1',
      message: 'the actual ask',
      history: ['earlier turn'],
    });
    expect(input.indexOf('earlier turn')).toBeLessThan(input.indexOf('the actual ask'));
  });

  it('includes attachment names so the model can refer to them', () => {
    const input = buildExtractInput({
      projectId: 'p1',
      message: 'x',
      attachments: [{ name: 'resume.pdf', text: 'short' }],
    });
    expect(input).toContain('resume.pdf');
  });
});

describe('parseJsonBlock', () => {
  it('reads a bare object', () => {
    expect(parseJsonBlock('{"a":1}')).toEqual({ a: 1 });
  });

  it('reads through a fenced block', () => {
    expect(parseJsonBlock('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('reads through a prose preamble', () => {
    expect(parseJsonBlock('Here you go:\n{"a":1}')).toEqual({ a: 1 });
  });

  it('throws when there is no object at all', () => {
    expect(() => parseJsonBlock('I cannot do that')).toThrow(CompilationError);
  });

  it('throws on a truncated object rather than returning a partial', () => {
    expect(() => parseJsonBlock('{"a": [1, 2}')).toThrow(CompilationError);
  });
});

describe('validateIntent', () => {
  it('clamps an out-of-range score rather than trusting it', () => {
    expect(validateIntent({ ...CLEAR_INTENT, ambiguityScore: 4.2 }).ambiguityScore).toBe(1);
    expect(validateIntent({ ...CLEAR_INTENT, ambiguityScore: -1 }).ambiguityScore).toBe(0);
    expect(validateIntent({ ...CLEAR_INTENT, ambiguityScore: 'high' }).ambiguityScore).toBe(0);
  });

  it('nulls a deadline it cannot parse instead of failing the compile', () => {
    expect(validateIntent({ ...CLEAR_INTENT, deadline: 'sometime soon' }).deadline).toBeNull();
  });

  it('normalizes a parseable deadline to ISO-8601', () => {
    expect(validateIntent({ ...CLEAR_INTENT, deadline: '2026-09-01' }).deadline).toBe(
      '2026-09-01T00:00:00.000Z',
    );
  });

  it('falls back to the "other" domain for an unknown value', () => {
    expect(validateIntent({ ...CLEAR_INTENT, domain: 'astrology' }).domain).toBe('other');
  });

  it('caps clarifying questions at two', () => {
    const intent = validateIntent({
      ...CLEAR_INTENT,
      clarifyingQuestions: ['a?', 'b?', 'c?', 'd?'],
    });
    expect(intent.clarifyingQuestions).toHaveLength(2);
  });

  it('rejects intent with no objective', () => {
    expect(() => validateIntent({ ...CLEAR_INTENT, objective: '   ' })).toThrow(CompilationError);
  });

  it('rejects a non-object entirely', () => {
    expect(() => validateIntent('not an object')).toThrow(CompilationError);
  });
});

describe('validatePlanBody', () => {
  it('forces coordinator steps to consequential even when labeled otherwise', () => {
    const { steps } = validatePlanBody({
      assumptions: [],
      steps: [
        {
          id: 's1',
          title: 'Send the intro email',
          agent: 'coordinator',
          tools: ['gmail_send'],
          risk: 'read-only',
          dependsOn: [],
          produces: null,
        },
      ],
    });
    expect(steps[0]!.risk).toBe('consequential');
  });

  it('drops dependencies on steps that do not exist', () => {
    const { steps } = validatePlanBody({
      assumptions: [],
      steps: [{ ...RESEARCH_STEP, dependsOn: ['nonexistent'] }],
    });
    expect(steps[0]!.dependsOn).toEqual([]);
  });

  it('drops self and forward references that would deadlock the plan', () => {
    const { steps } = validatePlanBody({
      assumptions: [],
      steps: [
        { ...RESEARCH_STEP, id: 's1', dependsOn: ['s1', 's2'] },
        { ...PLANNING_STEP, id: 's2', dependsOn: ['s1'] },
      ],
    });
    expect(steps[0]!.dependsOn).toEqual([]);
    expect(steps[1]!.dependsOn).toEqual(['s1']);
  });

  it('assigns ids to steps the model left unnamed', () => {
    const { steps } = validatePlanBody({
      assumptions: [],
      steps: [{ ...RESEARCH_STEP, id: undefined }],
    });
    expect(steps[0]!.id).toBe('s1');
  });

  it('rejects an empty plan', () => {
    expect(() => validatePlanBody({ assumptions: [], steps: [] })).toThrow(CompilationError);
  });

  it('produces a plan that can always start', () => {
    const { steps } = validatePlanBody(SIMPLE_PLAN);
    const plan: Plan = {
      id: 'p',
      projectId: 'p1',
      intent: validateIntent(CLEAR_INTENT),
      steps,
      assumptions: [],
      createdAt: new Date().toISOString(),
      revision: 1,
    };
    expect(readySteps(plan).map((s) => s.id)).toEqual(['s1']);
    expect(isStalled(plan)).toBe(false);
  });
});
