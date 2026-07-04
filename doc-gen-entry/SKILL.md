---
name: doc-gen-entry
description: Use when user invokes /doc-gen-entry or wants to generate complete project documentation by scanning the codebase, building a checklist of modules/features, and dispatching subagents per item.
---

# Doc-Gen Entry

## Overview

Systematically document an entire project by: scanning structure, building a
checklist, then running parallel subagents — each responsible for one item.

## Process

### Phase 1 — Project Scan

Use Glob + Read to explore:
- Root config files: `package.json`, `docker-compose.yml`, `Makefile`, `README.md`, `*.toml`, `*.yaml`
- Top-level directories and any `apps/`, `services/`, `packages/` subdirs
- Identify: monorepo vs single app, microservices vs modules vs feature-based structure

Then ask the user ONE question with checkboxes:

> I found: [list what you found]. What should I document?
> - [ ] Microservices / containers
> - [ ] Functional modules (features/flows)
> - [ ] Both
> - [ ] Something else (describe)

### Phase 2 — Build Checklist

Generate `__docs/TOC.md` with this structure:

```markdown
# Project Documentation Index
_Generated: <date>_

## Microservices
- [ ] **api** — `apps/api/` — REST API, RAG pipeline
- [ ] **docgen** — `apps/docgen/` — Doc generation service

## Features / Flows
- [ ] **RAG Pipeline** — query → embed → search → rerank → LLM answer
- [ ] **DocGen subprocess** — Claude CLI runner, provider switching
```

Each item must have: name, path/scope hint, one-line description.
Save the file, then show it to the user.

### Phase 3 — Dispatch Loop

Count unchecked items in TOC.md.

**If > 5 items:** Ask which to document first (user picks subset).
**If ≤ 5 items:** Proceed with all.

For each selected batch, dispatch subagents IN PARALLEL using the Agent tool.
After all subagents complete, mark items as done in TOC.md (`- [x]`).

Repeat: ask about next batch → dispatch → mark done.
Stop when all items checked or user says stop.

### Phase 4 — Subagent Prompt Template

For each item, generate a prompt using this template:

```
You are a documentation specialist. Your task: document ONE specific item from
this project.

## Item
Name: {{item_name}}
Scope: {{item_path_or_description}}
One-liner: {{item_description}}

## Your task
1. Read all relevant source files within the scope above
2. Understand: architecture, responsibilities, data flows, external dependencies,
   configuration, error handling, and public interfaces
3. Write complete documentation covering:
   - **Business purpose** — what problem does this solve, who uses it
   - **Technical architecture** — components, patterns, technology choices
   - **Data flows** — inputs → processing → outputs, with sequence if relevant
   - **Configuration** — env vars, feature flags, tuneable parameters
   - **Integration points** — what it calls, what calls it
   - **Failure modes** — what can go wrong, how it degrades
4. Save documentation to: `__docs/{{item_slug}}/README.md`
   Create the directory if it doesn't exist.
5. If the item has sub-components worth separate files, create them in
   `__docs/{{item_slug}}/` (e.g. `data-flow.md`, `api-reference.md`)

Do NOT generate placeholder content. Only document what you actually find in
the code.
```

Fill in: `item_name`, `item_path_or_description`, `item_description`,
`item_slug` (kebab-case of the name).

## Common Mistakes

| Mistake | Counter |
|---------|---------|
| Skipping the user question and guessing scope | Always ask before building TOC |
| Running subagents sequentially | Use parallel Agent tool calls |
| Forgetting to update TOC.md checkboxes after batch | Mark `[x]` before asking about next batch |
| Subagent prompt with no specific scope | Always include path/scope hint |
| Creating `__docs/` if it already exists | Check first, don't overwrite existing docs |

## Red Flags

| Thought | Reality |
|---------|---------|
| "I know what to document, skip the scan" | Scan first — structure reveals the real units |
| "5 items is not that many, no need to ask" | >5 → always ask, user decides priority |
| "Subagent will figure out what to write" | Prompt must be explicit about all 6 doc sections |
| "I'll run subagents one by one to be safe" | Parallel is the point — use Agent with parallel calls |
