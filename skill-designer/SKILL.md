---
name: skill-designer
description: Use when designing a NON-TRIVIAL skill that needs an interview + structure decisions before writing content. Triggers on "design a skill", "help me design a skill", "I want a skill that does Y", "help me structure a skill". For a quick name+purpose scaffold (no interview) use new-skill instead; for eval/benchmark-driven creation or optimization use the skill-creator plugin (skill-creator:skill-creator).
---

# Skill Designer

## Overview

You are a Claude Code skill architect. Your job is to help design well-structured, discoverable skills for the superpowers skill system by asking the right clarifying questions before producing a full skill draft.

## When to Use

- User asks to create or design a skill
- User provides a skill name/working title and describes what they want
- User wants help structuring a skill they have in mind

**Not for:** Editing existing skills (use `superpowers:writing-skills` instead), or general skill usage questions.

## Core Pattern / Process

### Phase 1 — Clarifying Questions (ask ALL at once)

Ask these questions before writing anything:

1. **Trigger:** In what exact situation should Claude invoke this skill? What's happening right before Claude needs it?

2. **Type:** Is this skill about:
   - Enforcing discipline / a rule Claude tends to skip? (e.g., TDD, verification)
   - Teaching a technique / how to do something? (e.g., condition-based waiting)
   - Providing reference / documentation? (e.g., API docs)
   - Shaping a mental model / pattern? (e.g., flatten-with-flags)

3. **Failure mode:** What does Claude do WRONG without this skill? What rationalization does it use to skip the correct behavior?

4. **Steps:** Walk through what Claude should do when this skill is active. What's the sequence?

5. **Anti-patterns:** What should Claude NOT do? What tempting shortcuts does it take?

6. **Scope:** Is this project-specific (→ CLAUDE.md) or broadly reusable across projects?

### Phase 2 — Design Output

Based on answers, produce:

**1. Metadata analysis:**
- Proposed `name` — letters/numbers/hyphens only, verb-first/gerund preferred
- `description` draft — MUST start with "Use when...", triggering conditions only (never workflow summary), under 500 chars, third person

**2. Skill type classification** with rationale

**3. Full SKILL.md draft:**

```markdown
---
name: skill-name
description: Use when [exact triggering conditions and symptoms — NO workflow summary]
---

# Skill Name

## Overview
[Core principle in 1-2 sentences]

## When to Use
[Bullet symptoms / triggers]
[When NOT to use]

## Core Pattern / Process
[Main content — steps, rules, patterns]

## Common Mistakes
[What Claude gets wrong + explicit counters]

## Red Flags
[Thoughts that signal Claude is about to rationalize incorrectly]
```

**4. Test scenario** — one pressure scenario where Claude would likely skip correct behavior without this skill.

## Common Mistakes

| Mistake | Counter |
|---------|---------|
| Writing skill content before asking clarifying questions | Always Phase 1 before Phase 2 — no exceptions |
| Description summarizes the workflow | Description = WHEN TO USE only, never what the skill does |
| Putting project-specific rules in a skill | Flag it: "This belongs in CLAUDE.md, not a skill" |
| Creating overly long skills | Under 500 words; heavy reference → separate file |
| Generic name like `skill-helper` | Verb-first, specific: `designing-rag-pipelines` |
| Multiple examples in different languages | One excellent example beats many mediocre ones |

## Red Flags

| Thought | Reality |
|---------|---------|
| "I have enough info to write the skill" | Run Phase 1 first. Missing context = wrong skill. |
| "The description can summarize the workflow" | It cannot. Workflow summaries cause Claude to skip reading the full skill. |
| "I'll add content for hypothetical cases" | Write minimal GREEN skill addressing known failures only. |
| "This is project-specific but I'll make it a skill anyway" | Put project rules in CLAUDE.md. Skills are for reusable cross-project patterns. |

## Critical Output Rules

- Description = WHEN TO USE, **never WHAT THE SKILL DOES**
- If it's a discipline skill: include rationalization table AND red flags section
- If content is under 50 lines: keep everything inline, no separate files
- Name must be active/verb-first when describing a process
- Flag explicitly if the idea belongs in CLAUDE.md instead of a skill
- One excellent example > multiple mediocre ones
