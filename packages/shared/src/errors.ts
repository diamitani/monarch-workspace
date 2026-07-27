/**
 * Errors that carry enough for the UI to say something useful.
 *
 * Every error names what went wrong and what the person can do about it.
 * `userMessage` is shown directly; `message` goes to logs.
 */

export class MonarchError extends Error {
  constructor(
    message: string,
    readonly userMessage: string,
    readonly recoverable: boolean,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** The model produced something we could not parse into the expected shape. */
export class CompilationError extends MonarchError {
  constructor(detail: string) {
    super(
      `PAL compilation failed: ${detail}`,
      'Monarch could not read that request clearly. Try describing the outcome you want.',
      true,
    );
  }
}

/** A step tried an outward action without a granted approval. */
export class ApprovalRequiredError extends MonarchError {
  constructor(
    readonly approvalId: string,
    action: string,
  ) {
    super(
      `Blocked unapproved action: ${action}`,
      `Monarch needs your approval before it can ${action}.`,
      true,
    );
  }
}

/** A connected service refused, timed out, or returned something unusable. */
export class ToolExecutionError extends MonarchError {
  constructor(
    readonly toolName: string,
    detail: string,
    recoverable = true,
  ) {
    super(
      `Tool ${toolName} failed: ${detail}`,
      recoverable
        ? `The ${toolName} step did not complete. Monarch can retry it.`
        : `The ${toolName} step could not run. Check the connection in Settings.`,
      recoverable,
    );
  }
}

/** The person's connection to a service is missing or has been revoked. */
export class NotConnectedError extends MonarchError {
  constructor(readonly service: string) {
    super(
      `No active connection for ${service}`,
      `Connect ${service} in Settings to let Monarch use it.`,
      false,
    );
  }
}
