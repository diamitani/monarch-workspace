/**
 * Approval — the record that a person authorized a specific outward action.
 *
 * The rule the whole system rests on: nothing with `risk: 'consequential'`
 * executes without a matching granted approval. Approvals are per-action and
 * never inferred from a previous one.
 */

export interface ActionPreview {
  /** What the person will see. "Send email to dana@example.com". */
  summary: string;
  /** The specific service being touched. "gmail", "googlecalendar". */
  service: string;
  toolName: string;
  /** Exact arguments, with secrets already stripped. Shown verbatim. */
  arguments: Record<string, unknown>;
  /** Whether this can be undone, and how. Null when it cannot. */
  reversal: string | null;
}

export const APPROVAL_STATES = ['pending', 'granted', 'denied', 'expired'] as const;
export type ApprovalState = (typeof APPROVAL_STATES)[number];

export interface Approval {
  id: string;
  projectId: string;
  stepId: string;
  preview: ActionPreview;
  state: ApprovalState;
  requestedAt: string;
  decidedAt: string | null;
  /** Set when the person edited the action before approving it. */
  amendedArguments: Record<string, unknown> | null;
}

/**
 * Approvals go stale rather than sitting open forever — an hour-old "send this
 * email" is no longer something the person has in mind.
 */
export const APPROVAL_TTL_MS = 30 * 60 * 1000;

export function isExpired(approval: Approval, now = Date.now()): boolean {
  return now - Date.parse(approval.requestedAt) >= APPROVAL_TTL_MS;
}

/** Whether this approval can still be decided on. */
export function isActionable(approval: Approval, now = Date.now()): boolean {
  return approval.state === 'pending' && !isExpired(approval, now);
}

/**
 * The single gate the runtime consults before an outward call. Anything other
 * than a granted, unexpired approval means do not proceed.
 */
export function permitsExecution(approval: Approval, now = Date.now()): boolean {
  return approval.state === 'granted' && !isExpired(approval, now);
}

/** The arguments to actually execute with — amendments win over the original. */
export function effectiveArguments(approval: Approval): Record<string, unknown> {
  return approval.amendedArguments ?? approval.preview.arguments;
}
