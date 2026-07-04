# ai-skille

Reusable Claude Code skills. Each directory is one skill — `SKILL.md` (the logic, auto-discovered) plus optional `README.md` and `scripts/`.

## Skills

| Skill | What it does |
|---|---|
| [`figma-mockup-to-spec`](./figma-mockup-to-spec/) | Figma mockup / UI screenshot → numbered overlay on the image → clickable per-component interview → spec file → delegates planning/implementation to superpowers skills. |
| [`map-architecture`](./map-architecture/) | Scans the project with parallel agents and generates/updates `ARCHITECTURE.md` (modules, API surface, message bus, entities). |
| [`find-patterns`](./find-patterns/) | Whole-codebase analysis → `PATTERNS.md` (layers, naming conventions, design patterns, glossary, Mermaid diagrams). |
| [`scan-project`](./scan-project/) | Quick project context (`.claude/project-context.md`) before implementing a new feature. |
| [`multi-model-quality-code`](./multi-model-quality-code/) | Multi-model consensus (Sonnet + Opus + o3 + Gemini) for high-stakes tasks — payments, auth, architecture, concurrency. |
| [`svg-icon-designer`](./svg-icon-designer/) | Designing and extending SVG icon sets (line-style, one concept = one symbol). |
| [`skill-designer`](./skill-designer/) | Designing new skills — clarifying questions → complete `SKILL.md` draft. |
| [`new-skill`](./new-skill/) | Quickly scaffolds a skill from just a name + purpose. |
| [`stoat-send`](./stoat-send/) | Sends a message/link (text/markdown) to a Stoat channel via webhook (send-only). Secret `STOAT_WEBHOOK_URL` lives in `~/.secrets`. |
| [`unconventional-thinking`](./unconventional-thinking/) | Anti-default protocol for open-ended creative questions — 3 proposals from different families + sanity tags. |
| [`proactive-signaling`](./proactive-signaling/) | Interrupts the flow with a single block when it spots a candidate for a skill / hook / automation / MCP / CLAUDE.md update. |
| [`planista-wynalazca`](./planista-wynalazca/) | Planner aiming for the non-obvious solution — one-question-at-a-time discovery → anti-default divergence → triage → scoring → plan starting from the cheapest hypothesis test. |
| [`agent-planner`](./agent-planner/) | From a document (PRD/spec/plan) designs a team of parallel implementation agents + ready-to-use prompts. |
| [`doc-gen-entry`](./doc-gen-entry/) | Generates full project documentation — module checklist → one subagent per item. |

## Installation

Skills are auto-discovered by Claude Code from `~/.claude/skills/`:

```bash
git clone git@github.com:kodown1k/ai-skille.git
cp -r ai-skille/<skill-name> ~/.claude/skills/
```

The skill is available immediately in a new Claude Code session. Skill-specific dependencies are described in its own `README.md` (if present).

> Note: the skills themselves are written in Polish (prompts and docs), as that's the language I work in with Claude Code. Claude follows them just as well either way.

## License

[MIT](./LICENSE)
