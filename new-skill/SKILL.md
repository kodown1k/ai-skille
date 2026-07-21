---
name: new-skill
description: Use for a FAST minimal skill scaffold from just a name + purpose (no interview). Triggers: "create a skill", "new skill", "stwórz skill", "nowy skill", or a quick "automate X for Claude". For a NON-TRIVIAL skill that needs an interview + structure decisions use skill-designer instead; for eval/benchmark-driven creation or optimization use the skill-creator plugin (skill-creator:skill-creator).
---

# New Skill Creator

You are creating a new Claude Code skill. The user has provided: `$ARGUMENTS`

## Step 1 — Gather information

If `$ARGUMENTS` is empty or incomplete, ask the user for:
1. **Skill name** — short, hyphenated, lowercase (e.g. `commit`, `review-pr`, `explain-code`)
2. **What the skill should do** — a plain-language description of its purpose

If both are provided in `$ARGUMENTS`, proceed directly to Step 2.

Parse `$ARGUMENTS` as: first word or quoted string = skill name, rest = purpose description.

## Step 2 — Design the skill

Based on the purpose description, expand it into a complete skill by thinking through:

- **When should Claude invoke this automatically?** → becomes the `description` field trigger phrases
- **What steps/instructions does Claude need?** → becomes the skill body
- **Does it have side effects** (deploy, commit, send message)? → if yes, add `disable-model-invocation: true`
- **Does it need arguments?** → add `argument-hint` and use `$ARGUMENTS` in body
- **What type is it?** Reference knowledge, step-by-step task, or interactive workflow?

## Step 3 — Create the skill file

Create the directory and file:

```bash
mkdir -p ~/.claude/skills/<SKILL-NAME>
```

Write `~/.claude/skills/<SKILL-NAME>/SKILL.md` with this structure:

```markdown
---
name: <skill-name>
description: Use when <specific triggering conditions — symptoms, situations, user phrases>. Use when user says "<phrase1>", "<phrase2>".
---

# <Skill Title>

## Overview
<1-2 sentences: what this skill does and its core principle>

## Instructions

<Step-by-step instructions Claude should follow. Be specific and actionable.>

<If the skill takes arguments, explain how to use $ARGUMENTS>
```

### Rules for the description field (CRITICAL):
- Start with "Use when..."
- List concrete trigger phrases, symptoms, situations
- **Never** summarize the workflow or steps — only describe WHEN to use it
- Max ~500 characters
- Written in third person

### Rules for the skill body:
- Be specific and actionable — Claude follows this literally
- For task skills: numbered steps
- For reference skills: clear sections with Quick Reference table
- Include `$ARGUMENTS` placeholder if the skill takes user input
- Keep under 500 lines; move heavy reference to separate files

## Step 4 — Confirm

After creating the file, tell the user:
- The skill was created at `~/.claude/skills/<name>/SKILL.md`
- How to invoke it: `/skill-name` or via description-based auto-detection
- Whether they should test it with a sample prompt
