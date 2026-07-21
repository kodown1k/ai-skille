---
name: scan-project
description: Use when starting work on a project, before implementing any new feature, or when codebase context is missing. Trigger when user says "scan project", "przeskanuj projekt", "przeanalizuj projekt", "analyze codebase", "what's the stack here", "help me understand this project", "zanim zaczniemy", or when implementing a feature and .claude/project-context.md doesn't exist yet. Always use this skill proactively before feature implementation if .claude/project-context.md is absent. NOT for a human-readable module/service map (use map-architecture → ARCHITECTURE.md), a patterns/conventions guide (use find-patterns → PATTERNS.md), or per-module doc generation (use doc-gen-entry → __docs/); scan-project writes the machine-oriented .claude/project-context.md consumed by feature-implementation skills.
---

# Scan Project — System Architect Analysis

Your task is to act as a system architect and produce a complete, structured analysis of the current project. Save all findings to `.claude/project-context.md`. Work through each phase below, using parallel reads where possible to be efficient.

## Phase 1: Tech Stack Discovery

Read these files if they exist:
- `composer.json` + `composer.lock` → PHP version, framework (Symfony/Laravel/Zend), key packages and versions
- `package.json` → JavaScript dependencies, build tools
- `Dockerfile` / `docker-compose.yml` → infrastructure, PHP version, services (DB, Redis, RabbitMQ)
- `.env.example` or `.env` → environment variables, database DSN, queue transport

Note the exact framework version and PHP version — they determine which patterns are available.

## Phase 2: Directory Structure

Use Glob to discover these locations:
- Source: `src/`, `lib/`, `app/`, `application/` (or `*/application/` for Zend)
- Config: `config/`, `app/config/`, `*/application/configs/`
- Tests: `tests/`, `features/` (Behat), `spec/`
- Migrations: `migrations/`, `src/Migrations/`, `*/application/data/migrations/`
- Public: `public/`, `web/`
- Templates: `templates/`, `views/`, `*/application/views/`

Identify whether this is a monorepo (multiple apps in subdirectories) or a single app. If monorepo, note each subproject's root.

## Phase 3: Data Layer

Search for and sample up to 10 examples of each:

**Doctrine Entities** (`**/Entity/*.php`):
- Extract: class name, table name from `#[ORM\Table]` or `@ORM\Table`, 3-5 key fields, relationships

**Repositories** (`**/Repository/*.php`):
- Note which entity they manage and any custom query methods

**Legacy models** (Zend: `*/application/models/*.php`):
- Note the class name and DB table they map to

## Phase 4: API Surface

**Symfony / API Platform:**
- Find `#[ApiResource]` or `@ApiResource` classes → list resource name, operations, path
- Find controllers: `**/Controller/*.php` → extract routes from `#[Route]` attributes or annotations
- Check `config/routes.yaml` or `config/routes/` for additional routing

**Legacy (Zend):**
- Find controllers in `*/application/controllers/` → note action methods
- Find SOAP models: `*/models/Soap/*.php`

Sample up to 15 endpoints total to illustrate the pattern.

## Phase 5: Services, Handlers, Messages

Search for (sample up to 8 of each):
- **Services**: `**/Service/*.php` — what they do (from class name + constructor dependencies)
- **Command/Event Handlers**: `**/Handler/*.php` — which message/command they handle
- **Messenger messages**: `**/Message/*.php` + `**/MessengerMessages/**/*.php`
- Check `config/packages/messenger.yaml` for routing (which queue each message goes to)
- **Event listeners/subscribers**: `**/EventListener/*.php`, `**/EventSubscriber/*.php`

## Phase 6: Architecture Pattern Identification

Based on what you found, determine:
- **Primary pattern**: Look for CQRS (separate Command/Query, Handler classes), DDD (Aggregates, Domain Events, Value Objects), Hexagonal (Ports/Adapters), standard layered MVC, or mixed
- **Naming conventions**: How are classes named? How are directories organized? (e.g., `App\FeatureName\MessageHandler\XxxHandler`)
- **Code style**: Does code use `declare(strict_types=1)`? PHP 8 attributes vs annotations? Type hints everywhere?
- **Test style**: PHPUnit unit tests? Behat functional tests? Both?

Look at 2-3 recently modified files to understand current team conventions.

## Phase 7: Write `.claude/project-context.md`

Create the directory if needed (`mkdir -p .claude`) and write the file with this structure:

```markdown
# Project Context

_Generated: [date]_

## Tech Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Language  | PHP       | x.x     |
| Framework | Symfony   | x.x     |
| ORM       | Doctrine  | x.x     |
| Queue     | RabbitMQ / Symfony Messenger | - |
| Database  | PostgreSQL / MySQL | - |
| Testing   | PHPUnit + Behat | - |

## Architecture
**Pattern**: [CQRS / DDD / Hexagonal / MVC / Mixed]

[2-3 sentence description of how the project is structured and why]

## Directory Map
[Annotated tree showing key directories with one-line descriptions]

## Data Layer

### Key Entities (sample)
| Entity | Table | Key Fields | Relations |
|--------|-------|-----------|-----------|
| ...    | ...   | ...       | ...       |

### Repositories
[List: ClassName → managed entity, notable custom methods]

## API Surface

### Endpoints (sample)
| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| ...    | ...  | ...     | ...     |

## Services & Handlers

### Services (sample)
[List: ClassName — one-line description]

### Message Handlers (sample)
| Handler | Message | Queue |
|---------|---------|-------|
| ...     | ...     | ...   |

## Naming Conventions
- **Namespaces**: [pattern, e.g. `App\FeatureName\SubComponent`]
- **Classes**: [pattern, e.g. `XxxMessageHandler`, `XxxRepository`]
- **Files**: [pattern]
- **DB tables**: [pattern, e.g. snake_case Polish names]

## How to Implement Common Features

### Add a new API endpoint (API Platform resource)
1. [Derived from actual project patterns]
2. ...

### Add a new Doctrine entity
1. [Derived from actual project patterns]
2. ...

### Add a new Symfony Messenger handler
1. [Derived from actual project patterns]
2. ...

### Add a new service
1. [Derived from actual project patterns]
2. ...
```

**Critical**: The "How to Implement" section must be derived from actual patterns you observed in the codebase — file locations, naming patterns, config files to update — not generic advice.

## Completion

After saving `.claude/project-context.md`:
1. Tell the user what was found: framework + version, architecture pattern, count of entities/endpoints/handlers discovered
2. Mention the file was saved and will be auto-loaded in future sessions
3. Ask: "What feature would you like to implement?"
