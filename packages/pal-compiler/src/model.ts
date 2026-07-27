/**
 * The model calls the compiler makes.
 *
 * Narrow on purpose: the compiler needs exactly one thing — "given a system
 * prompt and a user message, give me back a JSON object". Keeping the interface
 * this small means tests substitute a plain function, no SDK mocking.
 */

import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Message,
} from '@aws-sdk/client-bedrock-runtime';
import { CompilationError } from '@monarch/shared';

export interface JsonModel {
  /** Runs the prompt and parses the reply as JSON. Throws CompilationError if it is not. */
  completeJson(system: string, user: string): Promise<unknown>;
}

export interface BedrockModelOptions {
  modelId?: string;
  region?: string;
  /** Low by default — extraction and planning want consistency, not variety. */
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_MODEL = 'us.anthropic.claude-sonnet-4-5-20250929-v1:0';

export class BedrockJsonModel implements JsonModel {
  private readonly client: BedrockRuntimeClient;
  private readonly modelId: string;
  private readonly temperature: number;
  private readonly maxTokens: number;

  constructor(options: BedrockModelOptions = {}) {
    this.client = new BedrockRuntimeClient({
      region: options.region ?? process.env.AWS_REGION ?? 'us-east-1',
    });
    this.modelId = options.modelId ?? process.env.MONARCH_MODEL_ID ?? DEFAULT_MODEL;
    this.temperature = options.temperature ?? 0.1;
    this.maxTokens = options.maxTokens ?? 4096;
  }

  async completeJson(system: string, user: string): Promise<unknown> {
    const messages: Message[] = [{ role: 'user', content: [{ text: user }] }];

    const response = await this.client.send(
      new ConverseCommand({
        modelId: this.modelId,
        system: [{ text: system }],
        messages,
        inferenceConfig: {
          temperature: this.temperature,
          maxTokens: this.maxTokens,
        },
      }),
    );

    const text = response.output?.message?.content?.find((block) => 'text' in block)?.text;
    if (!text) {
      throw new CompilationError('model returned no text content');
    }

    return parseJsonBlock(text);
  }
}

/**
 * Models sometimes wrap JSON in prose or a fenced block despite instructions.
 * Pull out the outermost object rather than failing on a stray preamble.
 */
export function parseJsonBlock(text: string): unknown {
  const trimmed = text.trim();

  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new CompilationError('no JSON object found in model output');
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'unknown';
    throw new CompilationError(`malformed JSON in model output: ${detail}`);
  }
}
