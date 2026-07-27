/**
 * Model output is untrusted input. These functions turn `unknown` into typed
 * values or throw, so nothing downstream has to defend against a missing field.
 *
 * Hand-written rather than schema-library-driven: the shapes are small, and the
 * coercions here are deliberate (clamping scores, pruning dependencies) in ways
 * a generic validator would reject outright.
 */

import {
  AGENT_ROLES,
  ARTIFACT_KINDS,
  CompilationError,
  DOMAINS,
  RISK_LEVELS,
  type AgentRole,
  type ArtifactKind,
  type Domain,
  type Intent,
  type PlanStep,
  type RiskLevel,
} from '@monarch/shared';

function asRecord(value: unknown, what: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new CompilationError(`${what} is not an object`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, what: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new CompilationError(`${what} is missing or empty`);
  }
  return value.trim();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
    .map((v) => v.trim());
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function clamp01(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.NaN;
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** ISO-8601 date, or null. Anything unparseable becomes null rather than throwing. */
function asDateOrNull(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

export function validateIntent(raw: unknown): Intent {
  const o = asRecord(raw, 'intent');
  return {
    objective: asString(o.objective, 'intent.objective'),
    domain: asEnum<Domain>(o.domain, DOMAINS, 'other'),
    subject: asString(o.subject, 'intent.subject'),
    constraints: asStringArray(o.constraints),
    successCriteria: asStringArray(o.successCriteria),
    deadline: asDateOrNull(o.deadline),
    ambiguityScore: clamp01(o.ambiguityScore),
    clarifyingQuestions: asStringArray(o.clarifyingQuestions).slice(0, 2),
  };
}

export interface PlanBody {
  assumptions: string[];
  steps: PlanStep[];
}

export function validatePlanBody(raw: unknown): PlanBody {
  const o = asRecord(raw, 'plan');
  const rawSteps = Array.isArray(o.steps) ? o.steps : [];
  if (rawSteps.length === 0) {
    throw new CompilationError('plan contains no steps');
  }

  const steps = rawSteps.map((step, i) => validateStep(step, i));
  return { assumptions: asStringArray(o.assumptions), steps: pruneUnrunnableDeps(steps) };
}

function validateStep(raw: unknown, index: number): PlanStep {
  const o = asRecord(raw, `plan.steps[${index}]`);
  const agent = asEnum<AgentRole>(o.agent, AGENT_ROLES, 'researcher');

  const produces =
    typeof o.produces === 'string' && (ARTIFACT_KINDS as readonly string[]).includes(o.produces)
      ? (o.produces as ArtifactKind)
      : null;

  return {
    id: typeof o.id === 'string' && o.id.trim() !== '' ? o.id.trim() : `s${index + 1}`,
    title: asString(o.title, `plan.steps[${index}].title`),
    agent,
    tools: asStringArray(o.tools),
    // The coordinator exists only to touch the outside world. Force it to
    // consequential regardless of what the model claimed, so a mislabeled step
    // cannot slip past the approval gate.
    risk:
      agent === 'coordinator'
        ? 'consequential'
        : asEnum<RiskLevel>(o.risk, RISK_LEVELS, 'read-only'),
    dependsOn: asStringArray(o.dependsOn),
    status: 'pending',
    produces,
  };
}

/**
 * Keep only dependencies on steps that exist and appear earlier. Dangling,
 * self, and forward references are the three ways a generated plan ends up
 * unable to start; dropping them is better than shipping a deadlocked plan.
 */
function pruneUnrunnableDeps(steps: PlanStep[]): PlanStep[] {
  const positionOf = new Map(steps.map((s, i) => [s.id, i]));
  return steps.map((step, i) => ({
    ...step,
    dependsOn: step.dependsOn.filter((dep) => {
      const target = positionOf.get(dep);
      return target !== undefined && target < i;
    }),
  }));
}
