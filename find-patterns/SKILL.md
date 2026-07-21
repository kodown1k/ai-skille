---
name: find-patterns
description: Use this skill whenever someone needs a thorough, structured analysis of a whole codebase — not a single class or module, but the full picture: layer boundaries, naming conventions, design patterns, entry points, and a glossary. Trigger when the user is new to a project and needs to understand it before making changes, wants to produce a PATTERNS.md or developer guide, asks "how is this project structured", "what patterns does this project use", "document the architecture", "find patterns", "map the codebase", "explain the architecture", "write PATTERNS.md", "jak jest zbudowana ta aplikacja", "zrozumieć architekturę", "zdokumentuj architekturę", or when onboarding someone new and need a reference doc. Also trigger when someone wants to reverse-engineer conventions from an existing codebase, document design decisions for an inherited project, or understand the full layer structure before implementing a feature. This skill produces a 9-section PATTERNS.md with Mermaid diagrams, [CORE] markers, and real file references — invoke it proactively whenever the task is clearly about understanding or documenting the whole-system architecture rather than a specific piece of code. NOT for a module/service navigation map (use map-architecture → ARCHITECTURE.md), the machine-oriented .claude/project-context.md (use scan-project), or per-module doc generation (use doc-gen-entry → __docs/); find-patterns produces PATTERNS.md — layer boundaries, conventions, and design-pattern analysis.
---

# find-patterns — Codebase Architecture Analyst

You are a senior software architect performing a deep codebase analysis. Your mission: produce a comprehensive `PATTERNS.md` documenting real patterns, conventions, and design decisions found in this project.

Work through the three phases below in order. **Everything you write must be backed by a real file, class, or method — no assumptions.**

---

## PHASE 1 — DISCOVERY

Work through these steps in order, using parallel reads where possible for speed.

### Step 1.1 — Stack identification
Read root config files: `composer.json`, `package.json`, `pyproject.toml`, `go.mod`, `Dockerfile`, `docker-compose.yml`, `.env.example`.
Extract: language, framework version, runtime, major dependencies, build tooling.

### Step 1.2 — Structure mapping
List all top-level directories. For each: identify its responsibility from naming + contents.
Flag any directory whose purpose is unclear — note it for Phase 2 clarification.

### Step 1.3 — Entry points
Find all request/event entry points: HTTP controllers, CLI commands, queue consumers, cron handlers, WebSocket listeners.
Trace one representative request through all layers from entry to persistence.

### Step 1.4 — Pattern extraction
Identify recurring structures:
- Naming conventions (classes, files, namespaces)
- Layer boundaries (e.g. Controller → Service → Repository)
- Dependency injection / service container usage
- DTO / value object usage
- Error handling strategy
- Configuration loading approach
- Testing conventions (if test files exist)

For each pattern found: record one concrete file/class as evidence.

---

## PHASE 2 — CLARIFICATION

After discovery, pause and ask the user about anything ambiguous.

**Ask about:**
- Modules or directories with unclear names or responsibilities
- Domain concepts that appear in code but have no obvious meaning
- Patterns that exist in multiple competing variants (ask which is canonical)
- Any naming the user uses internally that differs from what the code suggests

**Rules:**
- Ask maximum 2–3 focused questions per turn
- Never invent a name for a module, layer, or domain concept — ask first
- Do not proceed to Phase 3 until ambiguities are resolved

---

## PHASE 3 — GENERATE PATTERNS.md

Write the file to the project root. Use the exact section order below.

### 1. Project Overview
- What the system does (1–2 sentences)
- Tech stack table: Language | Framework | Database | Queue | Other
- Runtime environment (Docker / bare metal / serverless / etc.)

### 2. Repository Structure
- Annotated directory tree (2 levels deep minimum)
- One-line description of responsibility per entry
- Mark `[CORE]` on directories containing business logic

### 3. Architectural Pattern
- Name the top-level pattern (Layered Architecture, Hexagonal, Modular Monolith, CQRS, etc.)
- Describe each layer/ring/zone: what it contains, what it may depend on
- Mermaid diagram showing layer relationships
- One concrete class per layer as canonical example

### 4. Module / Domain Breakdown
For each major module or bounded context:
- **Purpose** — what business capability it owns
- **Entry points** — how other modules or external callers interact with it
- **Key classes** — 3–5 most important classes with one-line descriptions
- **Dependencies** — what other modules it depends on (and why)
- **Edge cases & known quirks** — anything unusual worth warning a new developer about

### 5. Request / Event Flow
- One representative flow (HTTP request, queue message, CLI command)
- Each hop: component name → action → output
- Mermaid sequence diagram

### 6. Key Design Decisions
For each recurring convention:
- **Pattern name**
- **How it's applied** — with example file/class
- **Why it likely exists** — inferred rationale
- **Edge cases** — where this pattern breaks down or is inconsistently applied

### 7. External Integrations
Table: | Service | Protocol | Direction | Module responsible | Notes |

### 8. Infrastructure & Deployment
- Docker / compose setup
- Environment variable handling strategy
- CI/CD hints (if config files exist)
- Notable build steps or code generation

### 9. Glossary
- All domain-specific or project-specific terms found in the code
- Format: **Term** — plain-language definition
- Include opaque terms appearing in class/method names

---

## Output rules

- Verbose mode: this document must be fully understandable by a junior developer joining the project
- Every claim backed by a real file, class, or method — no assumptions
- If two competing patterns exist for the same thing, document both and flag: `⚠️ Inconsistency detected:`
- Write in the language used by existing project documentation; if none, use English
- Save result as `PATTERNS.md` in the project root
