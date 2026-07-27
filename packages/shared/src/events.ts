/**
 * Stream events — the wire format between the runtime and the browser.
 *
 * One discriminated union, serialized as SSE `data:` frames. The UI switches on
 * `type` and never has to guess at shape.
 */

import type { ArtifactKind, Plan, PlanStep, StepStatus } from './plan.js';
import type { ActionPreview } from './approval.js';

export type StreamEvent =
  | { type: 'plan'; plan: Plan }
  | { type: 'clarify'; questions: string[] }
  | { type: 'step-start'; step: PlanStep }
  | { type: 'text'; stepId: string; delta: string }
  | { type: 'tool-call'; stepId: string; toolName: string; arguments: Record<string, unknown> }
  | { type: 'tool-result'; stepId: string; toolName: string; ok: boolean; summary: string }
  | { type: 'approval-required'; approvalId: string; preview: ActionPreview }
  | { type: 'artifact'; artifactId: string; kind: ArtifactKind; title: string }
  | { type: 'step-end'; stepId: string; status: StepStatus }
  | { type: 'done'; projectId: string }
  | { type: 'error'; message: string; recoverable: boolean };

export function encodeSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Parses one SSE frame body. Returns null for keep-alives, terminators, and
 * malformed frames — a dropped frame should not tear down the stream.
 */
export function decodeSSE(frame: string): StreamEvent | null {
  const line = frame.trim();
  if (!line.startsWith('data:')) return null;

  const payload = line.slice(5).trim();
  if (payload === '' || payload === '[DONE]') return null;

  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof (parsed as { type?: unknown }).type !== 'string') return null;
    return parsed as StreamEvent;
  } catch {
    return null;
  }
}
