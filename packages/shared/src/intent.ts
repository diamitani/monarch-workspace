/**
 * Intent — the structured reading of what a person asked for.
 *
 * Produced by the PAL compiler's extraction stage. Everything downstream
 * (routing, planning, agent selection) reads from this rather than the raw text.
 */

export const DOMAINS = [
  'career',
  'life-admin',
  'creative',
  'research',
  'learning',
  'planning',
  'other',
] as const;

export type Domain = (typeof DOMAINS)[number];

/** Coarse read on how consequential the work is. Drives approval strictness. */
export const RISK_LEVELS = ['read-only', 'draft-only', 'consequential'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface Intent {
  /** Verb phrase: what the person wants done. "plan a move", "draft outreach emails". */
  objective: string;
  domain: Domain;
  /** The thing being acted on. "Chicago apartment search", "Q3 launch". */
  subject: string;
  /** Scope limits the person stated or clearly implied. */
  constraints: string[];
  /** What "done" looks like, in the person's terms. */
  successCriteria: string[];
  /** ISO-8601 date if a deadline was given or inferable, else null. */
  deadline: string | null;
  /**
   * 0 = the request is fully specified.
   * 1 = we cannot act without asking something first.
   * Above `CLARIFY_THRESHOLD` the compiler emits clarifying questions instead of a plan.
   */
  ambiguityScore: number;
  /** Questions worth asking before planning. Empty when the request is clear. */
  clarifyingQuestions: string[];
}

/** Above this, ask before planning. Tuned so most everyday requests pass straight through. */
export const CLARIFY_THRESHOLD = 0.6;

/**
 * A high score alone is not enough to stop on — without a question to ask, the
 * caller would have nothing to show the person. Planning on a guess beats a
 * dead end.
 */
export function needsClarification(intent: Intent): boolean {
  return intent.ambiguityScore > CLARIFY_THRESHOLD && intent.clarifyingQuestions.length > 0;
}
