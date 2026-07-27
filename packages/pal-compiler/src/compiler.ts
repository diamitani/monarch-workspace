/**
 * PAL — compiles a person's request into a plan.
 *
 * Two model passes, because they fail differently. Extraction can tell us the
 * request is too vague to plan; when it does we stop and ask rather than
 * planning against a guess. Planning only ever sees structured intent, so a
 * rambling message cannot leak into step titles.
 */

import { needsClarification, type Intent, type Plan } from '@monarch/shared';
import { BedrockJsonModel, type JsonModel } from './model.js';
import { EXTRACT_SYSTEM, PLAN_SYSTEM } from './prompts.js';
import { validateIntent, validatePlanBody } from './validate.js';

export interface AttachmentContext {
  name: string;
  /** Already-extracted text. The compiler never fetches anything itself. */
  text: string;
}

export interface CompileRequest {
  projectId: string;
  message: string;
  /** Prior turns, oldest first. Gives the compiler continuity across a conversation. */
  history?: string[];
  /** Text pulled from links and uploads the person attached. */
  attachments?: AttachmentContext[];
}

export type CompileResult =
  | { kind: 'plan'; plan: Plan }
  | { kind: 'clarify'; intent: Intent; questions: string[] };

export class PalCompiler {
  constructor(private readonly model: JsonModel = new BedrockJsonModel()) {}

  async compile(request: CompileRequest): Promise<CompileResult> {
    const intent = validateIntent(
      await this.model.completeJson(EXTRACT_SYSTEM, buildExtractInput(request)),
    );

    if (needsClarification(intent)) {
      return { kind: 'clarify', intent, questions: intent.clarifyingQuestions };
    }

    const body = validatePlanBody(
      await this.model.completeJson(PLAN_SYSTEM, JSON.stringify(intent, null, 2)),
    );

    return {
      kind: 'plan',
      plan: {
        id: `plan_${Date.now().toString(36)}`,
        projectId: request.projectId,
        intent,
        steps: body.steps,
        assumptions: body.assumptions,
        createdAt: new Date().toISOString(),
        revision: 1,
      },
    };
  }
}

/** Per-attachment cap. Enough to tell what a document is about without flooding context. */
export const ATTACHMENT_CHAR_LIMIT = 4000;

/**
 * The request goes last so it is the freshest thing in context — background
 * material should inform the reading, not displace it.
 */
export function buildExtractInput(request: CompileRequest): string {
  const parts: string[] = [];

  if (request.history?.length) {
    parts.push('Earlier in this conversation:', request.history.join('\n'), '');
  }

  for (const attachment of request.attachments ?? []) {
    const text = attachment.text.slice(0, ATTACHMENT_CHAR_LIMIT);
    const truncated = attachment.text.length > ATTACHMENT_CHAR_LIMIT ? '\n[…truncated]' : '';
    parts.push(`Attachment "${attachment.name}":`, text + truncated, '');
  }

  parts.push('Request:', request.message);
  return parts.join('\n');
}
