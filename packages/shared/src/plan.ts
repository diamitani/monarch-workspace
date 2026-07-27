/**
 * Plan — the readable execution plan a person sees and edits before anything runs.
 *
 * This is the trust surface. Every step names the agent that will run it and
 * whether it will reach outside Monarch. Nothing consequential executes without
 * an approval recorded against the step.
 */

import type { Intent, RiskLevel } from './intent.js';

export const AGENT_ROLES = [
  'researcher',
  'planner',
  'writer',
  'organizer',
  'coordinator',
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export const STEP_STATUSES = [
  'pending',
  'awaiting-approval',
  'running',
  'done',
  'failed',
  'skipped',
] as const;

export type StepStatus = (typeof STEP_STATUSES)[number];

export const ARTIFACT_KINDS = [
  'brief',
  'plan',
  'document',
  'checklist',
  'table',
  'tracker',
] as const;

export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export interface PlanStep {
  id: string;
  /** Plain-language description. Written for the person, not the system. */
  title: string;
  agent: AgentRole;
  /** Tool names this step may call. Empty means model-only reasoning. */
  tools: string[];
  risk: RiskLevel;
  /** Step ids that must finish before this one starts. */
  dependsOn: string[];
  status: StepStatus;
  /** What this step produces, if anything. */
  produces: ArtifactKind | null;
}

export interface Plan {
  id: string;
  projectId: string;
  intent: Intent;
  steps: PlanStep[];
  /** Assumptions the plan rests on. Surfaced so the person can correct them. */
  assumptions: string[];
  createdAt: string;
  /** Bumped on every user edit so we can show revision history. */
  revision: number;
}

/** Steps whose dependencies are all satisfied and which can start now. */
export function readySteps(plan: Plan): PlanStep[] {
  const done = new Set(plan.steps.filter((s) => s.status === 'done').map((s) => s.id));
  return plan.steps.filter(
    (s) => s.status === 'pending' && s.dependsOn.every((d) => done.has(d)),
  );
}

/**
 * True when work remains but nothing can start and nothing is running — the
 * plan needs a person before it can move again.
 */
export function isStalled(plan: Plan): boolean {
  const remaining = plan.steps.some((s) => s.status === 'pending');
  if (!remaining) return false;
  const running = plan.steps.some((s) => s.status === 'running');
  return readySteps(plan).length === 0 && !running;
}

/** Fraction of steps that reached a terminal state, for progress display. */
export function completionRatio(plan: Plan): number {
  if (plan.steps.length === 0) return 1;
  const settled = plan.steps.filter(
    (s) => s.status === 'done' || s.status === 'skipped' || s.status === 'failed',
  ).length;
  return settled / plan.steps.length;
}
