---
name: map-architecture
description: Use when starting work on a new project, when ARCHITECTURE.md is missing or outdated, when the user says "map architecture", "zmapuj architekturę", "przeskanuj projekt", "stwórz mapę projektu", "zaktualizuj architekturę", "update architecture", "scan project structure", "what modules does this project have", "jakie moduły ma ten projekt". Also use proactively when ARCHITECTURE.md doesn't exist and user asks about project structure.
argument-hint: [optional: specific area to focus on, e.g. "admin-api" or "only new modules"]
---

# Map Architecture — Project Structure Discovery & Documentation

## Overview

Scans the entire project using parallel subagents to detect microservices, modules, functionalities, and API resources. Then presents all findings to the user for naming and confirmation, and generates/updates `ARCHITECTURE.md` in the project root as a persistent navigation map for Claude Code.

## Why This Exists

Without this map, Claude Code must re-scan the project structure in every new conversation. ARCHITECTURE.md acts as a **pre-built index** with human-confirmed names for all components, dramatically reducing orientation time.

## Instructions

### Phase 1 — Parallel Scanning

Launch **5 parallel subagents** (using the Agent tool with `subagent_type: "Explore"`) to scan different dimensions of the project. Each agent should return structured findings.

**Agent 1 — Top-Level Services**
```
Scan the project root. For each top-level directory:
- Identify if it's a standalone service/application (has its own composer.json, package.json, Dockerfile, or similar)
- Detect the framework and PHP/language version
- Find the entry point (index.php, bin/console, server.php, etc.)
- Check for CLAUDE.md or README.md for self-description
- Return: list of {directory, type (service/library/config/docs), framework, language_version, entry_point, self_description}
```

**Agent 2 — Internal Modules per Service**
```
For each service/application directory found to contain src/ or application/:
- List all module directories (direct children of src/, or feature directories)
- For each module, detect: main classes, purpose (from class names and namespaces)
- Count files per module
- Identify module dependencies (imports from other modules)
- Return: list of {service, module_path, main_classes, estimated_purpose, file_count, dependencies}
```

**Agent 3 — API Resources & Endpoints**
```
Scan for API definitions:
- API Platform resource configs (YAML in config/mapping/ or config/services/, or PHP attributes #[ApiResource])
- Symfony routes (config/routes/, controller annotations/attributes)
- SOAP endpoints (Zend SOAP handlers, WSDL files)
- REST controllers
- Return: list of {service, resource_name, path/route, http_methods, format (REST/SOAP/GraphQL), config_file}
```

**Agent 4 — Message Bus & Async Communication**
```
Scan for messaging infrastructure:
- Symfony Messenger message classes (messenger/ directory, messages/ directories)
- Message handlers (MessageHandler directories, __invoke methods)
- Transport/queue configuration (messenger.yaml)
- Zend Sbi_Messenger usage
- Return: list of {message_class, handler_class, transport/queue, direction (publish/consume), service}
```

**Agent 5 — Database & Persistence**
```
Scan for data layer:
- Doctrine entity classes (Entity/ directories, ORM mappings)
- Database migration files
- Key SQL schema files
- Repository classes
- Return: list of {entity_name, table_name, service, repository_class, migration_files}
```

### Phase 2 — Compile & Present Findings

After all agents complete:

1. **Merge results** into a structured overview grouped by detected service/application
2. **Identify relationships** — which services share entities, which communicate via messages
3. **Present findings to the user** in a single organized block:

```
I've scanned the project and found the following structure:

## Detected Services (top-level)
| # | Directory | Detected Type | Framework | Description |
|---|-----------|--------------|-----------|-------------|
| 1 | admin-api/ | Web API | Symfony 5.4 | [auto-detected purpose] |
| 2 | ebo/ws/ | SOAP API | Zend FW 1 | [auto-detected purpose] |
| ... | ... | ... | ... | ... |

## Detected Modules (per service)
### admin-api/
| # | Module Path | Main Classes | Estimated Purpose |
|---|-------------|-------------|-------------------|
| 1 | src/Auth/ | JsonAuthenticator, ... | Authentication |
| ... | ... | ... | ... |

### [next service...]

## Detected API Resources
| # | Service | Resource | Path | Methods |
|---|---------|----------|------|---------|
| 1 | admin-api | ImportFile | /api/import-files | GET, POST |
| ... | ... | ... | ... | ... |

## Detected Message Channels
| # | Message | Handler | Queue |
|---|---------|---------|-------|
| 1 | ImportClientConfigMessage | ImportClientConfigHandler | import_client_config |
| ... | ... | ... | ... |

---

Please review and provide:
1. **Service names** — What do you call each top-level service? (e.g., "Panel Operatora", "API Klienta")
2. **Module names** — Any custom names for modules? (e.g., "Import Konfiguracji Klientów" for ClientSysConfig)
3. **Corrections** — Anything I misidentified or missed?
4. **Groupings** — Should any modules be grouped differently?
```

### Phase 3 — Generate/Update ARCHITECTURE.md

After the user confirms names and structure:

1. **Check if ARCHITECTURE.md exists** in the project root
2. If it exists, **read the current version** and merge updates (preserve user-written sections, update detected structure)
3. If new, **generate from template** below

#### ARCHITECTURE.md Template

```markdown
# ARCHITECTURE.md — [Project Name]

> Auto-generated project map. Last updated: [DATE]
> Human-confirmed names and structure for Claude Code navigation.
>
> **IMPORTANT:** Claude Code should read this file at the start of every session
> to understand project structure without re-scanning.

---

## Quick Navigation

| Service | Directory | Type | Framework | Description |
|---------|-----------|------|-----------|-------------|
| [Human Name] | `directory/` | API/Library/Worker | Framework X | One-line purpose |

---

## Services

### [Human Name for Service] (`directory/`)

**Type:** [Web API / SOAP API / Library / Worker / CLI Tool]
**Framework:** [Symfony 5.4 / Zend FW 1 / etc.]
**Entry Point:** `path/to/entry`
**Documentation:** `path/to/CLAUDE.md` (if exists)

#### Modules

| Module | Path | Purpose | Key Classes |
|--------|------|---------|-------------|
| [Human Name] | `src/Module/` | One-line purpose | `Class1`, `Class2` |

#### API Resources

| Resource | Path | Methods | Config |
|----------|------|---------|--------|
| ResourceName | `/api/path` | GET, POST | `config/file.yaml` |

---

[Repeat for each service]

---

## Cross-Service Communication

### Message Bus

| Message | Publisher | Consumer | Queue | Purpose |
|---------|----------|----------|-------|---------|
| `MessageClass` | service-a | service-b | queue_name | One-line purpose |

### Shared Entities

| Entity | Table | Used By | Repository |
|--------|-------|---------|------------|
| `EntityClass` | `table_name` | service-a, service-b | `RepoClass` |

---

## Glossary

| Term | Meaning | Where Used |
|------|---------|------------|
| [Domain Term] | [Definition] | [Services/modules] |

---

## Conventions

- [Naming conventions detected in the project]
- [File organization patterns]
- [Other conventions worth noting]
```

### Phase 4 — Ensure Persistence

After generating ARCHITECTURE.md:

1. **Check CLAUDE.md** in the project root — if it doesn't already reference ARCHITECTURE.md, suggest adding:
   ```
   ## Project Architecture Map
   Always read `ARCHITECTURE.md` at the start of each session for project structure and component names.
   ```

2. **Inform the user** that ARCHITECTURE.md has been created/updated and how it will be used.

### Update Mode

If `<args>` specifies a specific area (e.g., "admin-api" or "only new modules"):

1. Read existing ARCHITECTURE.md
2. Run only the relevant subagents for the specified area
3. Present only new/changed findings to the user
4. Merge updates into the existing file, preserving unchanged sections

If no args but ARCHITECTURE.md already exists:

1. Read existing ARCHITECTURE.md
2. Run all subagents
3. Diff against existing content
4. Present only **new or changed** components to the user
5. Ask: "Should I update these sections, or regenerate the entire file?"

## Important Notes

- Always use human-confirmed names, never auto-generated labels alone
- Preserve any manually-added sections in existing ARCHITECTURE.md
- The Glossary section should capture domain-specific Polish terms with English translations (this is common in Polish financial software projects)
- Keep the file under 800 lines — use links to sub-documentation for deep details
- Mark sections with `[CORE]` for the most important components that are frequently referenced
