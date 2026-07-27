# Monarch Core

An agentic AI workspace for people who don't write code. Describe a goal in plain
language; specialized agents plan the work, do it, and pause for approval before
anything reaches the outside world.

## Status

Early. The intent compiler and its type contracts are built and tested. The
runtime, agents, tool bridge, and API are not yet implemented.

| Package | State |
|---|---|
| `@monarch/shared` | Type contracts: intent, plan, approval, stream events, errors |
| `@monarch/pal-compiler` | Request → plan, via two Bedrock passes |
| `@monarch/agentcore-runtime` | Not started |
| `@monarch/rostr-agents` | Not started |
| `@monarch/composio-bridge` | Not started |
| `@monarch/data-layer` | Not started |
| `@monarch/api` | Not started |

## The idea

A request like *"help me plan my move to Chicago"* becomes a readable plan —
objective, assumptions, numbered steps, and a clear mark on any step that would
send, publish, schedule, or spend. The person edits the plan, approves the steps
that touch the outside world, and watches the rest run.

Two properties hold the design together:

**Nothing consequential runs unapproved.** Steps carry a risk level. Anything
marked `consequential` blocks on a recorded, per-action approval — never inferred
from a previous one, never granted in bulk.

**The plan is the interface.** Agents are an implementation detail. People read
step titles written in their own vocabulary, not agent names or tool calls.

## Architecture

```
request
   │
   ▼
PAL compiler ── extract intent ──► too vague? ──► ask, don't guess
   │                                   │
   │                                   ▼
   └────────────────────────────► build plan
                                       │
                                       ▼
                              runtime executes steps
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
              read / draft                        consequential
              runs freely                     blocks for approval
```

The compiler runs two model passes rather than one. Extraction can report that a
request is too vague to plan; when it does, the second pass never runs and the
person gets a question instead of a plan built on a guess. Planning only ever
sees structured intent, so a rambling message can't leak into step titles.

## Develop

```bash
pnpm install
pnpm test        # vitest, no AWS calls — the model is substituted
pnpm typecheck
```

Tests script the model with canned replies, so the suite runs offline and
deterministically. Live Bedrock calls need `AWS_REGION` and credentials with
`bedrock:Converse` on the target model.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `AWS_REGION` | Bedrock region | `us-east-1` |
| `MONARCH_MODEL_ID` | Inference profile for compilation | Claude Sonnet 4.5 |

## License

Not yet licensed. All rights reserved.
