---
name: figma-mockup-to-spec
description: Use when the user shares a Figma design/frame URL or a UI screenshot and wants to capture what each component DOES (behavior, props, variants) into a written spec before building — e.g. pastes a figma.com/design link, says "zrób z tej makiety", "spec z Figmy", "makieta na kod", or wants a per-component breakdown of a mockup. Not for plain design-to-code with no behavior interview (use the Figma MCP design-to-code path).
---

# Figma Mockup → Spec

## Overview

Turn a Figma frame (or any UI screenshot) into a written, per-component specification by anchoring an interview to a **numbered visual overlay**, then hand off to the existing superpowers pipeline for planning and implementation. This skill OWNS only the Figma-specific front end (intake → overlay → interview → spec file). It DELEGATES planning and implementation to existing superpowers skills — it never *silently* re-implements them; any implementation happens only behind checkpoint 7 (including the explicit inline escape hatch).

## When to Use

- User pastes a `figma.com/design/...?node-id=...` link, or a screenshot, and wants a spec or code.
- User wants to describe what each piece of a mockup does before anything gets built.

**Not for:** writing TO Figma (use `/figma-generate-design`); pure visual reproduction with no behavior capture (just build the HTML); editing an existing spec.

## Core Process

Each phase ends at a **checkpoint** — ask the user before moving on. Never skip a checkpoint.

**0 — Intake.** If no Figma URL was given, ask for one. It MUST contain `node-id` (extract `fileKey` + `nodeId` from the URL). For a bare screenshot, skip to phase 2 with the image file.

**1 — Render (cost-aware).** Call Figma MCP `get_metadata` once to see if the node is a real layer tree or a flattened bitmap, then `get_screenshot` ONCE at native `maxDimension`. Download the PNG with `curl`. Do NOT call `get_screenshot` repeatedly at different sizes — Figma's free (Starter) plan allows only ~6 read calls/month; each call burns one. Account for reads already spent earlier in the session, and if unsure whether the monthly quota remains, ask the user before calling — do not probe. If `get_metadata` shows a single flat rectangle, tell the user the node is an embedded image (no tokens/structure extractable) — analysis is vision-based.

**2 — Offer the numbered overlay.** Ask: "Wygenerować numerki na komponentach?" If yes:
   - Identify each distinct component from the screenshot; assign a label (A, B, C…).
   - Write markers JSON (`[{"label","fx","fy"}]`, fractional coords) and run the bundled script by its **skill-absolute path** (`~/.claude/skills/figma-mockup-to-spec/scripts/annotate.py <src> <out> <markers.json>`) — cwd resets between bash calls. Requires Pillow (`pip install pillow`).
   - **VERIFY:** read the output PNG and move any marker that landed off its element. Repeat until every marker sits on its target. Save the overlay next to the spec.
   - **SHOW the user:** if a display is available (`$DISPLAY` set), open the verified overlay in the browser so the numbered markers stay visible during the interview — `nohup google-chrome --new-window "file://<abs-path>" &` (or `xdg-open <abs-path>`). If no display (headless/remote), skip and just give the file path.

**3 — Interview, inventory-first + choice-driven (two-pass).** Produce a full component inventory TABLE first (ID · region/what-I-see · my guess at "what it does"). Then walk component-by-component using **`AskUserQuestion`** (never open prose), batching up to 4 components per call.
   - **Pass 1 — disposition.** Per component: `header` = ID + progress (e.g. `A — 1/13`), `multiSelect: true`, options = `Do zaimplementowania` / `Już gotowy w kodzie` / `Wymaga poprawki wyglądu` / `Pomiń`.
   - **Pass 2 — details (REQUIRED for every component not `Pomiń`).** A follow-up `AskUserQuestion`: offer behavior-shape shortcuts as options (e.g. `Modal/popup`, `Osobny ekran/route`, `Kreator wielokrokowy`, `Akcja inline`) and tell the user to type the real spec via the auto "Other" field — **co ma robić, jak działa, co otwiera**, plus format/props/wariant. The free text IS the spec content; options are only starting points. A disposition alone (no behavior text) is NOT a complete answer for `Do zaimplementowania`.
   Record every answer into the running spec; you are the scribe.

**4 — Write the spec file.** Save `specs/<mockup-name>-spec.md` (markdown). One section per component: ID, behavior, exists-in-code (unknown until phase 5), format/props, notes. Include the overlay image path and the Figma URL.

**5 — Checkpoint: compare with code.** Ask whether to dispatch an agent. If yes, launch an `Explore` (or `feature-dev:code-explorer`) agent / codegraph to locate which components already exist in the target codebase. Fold findings into the spec as `exists | partial | missing` per component.

**6 — Checkpoint: plan.** Ask whether to write an implementation plan. If yes, invoke **`superpowers:writing-plans`** with the spec as input. Do not write the plan yourself.

**7 — Checkpoint: implement.** Ask which mode:
   - **`superpowers:subagent-driven-development`** — independent tasks in the current session.
   - **`superpowers:executing-plans`** — separate session with review checkpoints.
   - **inline** — implement directly here.
   Hand off to the chosen skill. Do not re-implement its logic.

## Common Mistakes

| Mistake | Counter |
|---------|---------|
| Re-implementing planning/implementation inside this skill | Delegate to `writing-plans` / `subagent-driven-development` / `executing-plans`. |
| Calling `get_screenshot` several times at different sizes | One native-resolution read. Free plan = ~6 reads/month. |
| Trusting marker coordinates without looking | Render the overlay, read it back, fix strays — every time. |
| Expecting tokens/structure from a flat bitmap node | `get_metadata` reveals it; if flat, say so and go vision-based. |
| Interviewing before showing the inventory | Inventory-first surfaces what you missed and is faster to correct. |
| Asking open prose questions per component | Use `AskUserQuestion`: clickable options + free-text "Other" in one step. Prose stalls (user replies "a" and nothing is captured). |
| Skipping a checkpoint to "save time" | Each checkpoint is a user decision gate. Ask. |

## Red Flags

| Thought | Reality |
|---------|---------|
| "I'll just write the plan myself" | Stop — invoke `superpowers:writing-plans`. |
| "The markers are probably fine" | You don't know until you read the rendered overlay. |
| "Let me grab a higher-res shot too" | That's a second metered Figma read. Pull native once. |
| "I'll implement it inline, faster than asking" | Mode is the user's call — checkpoint 7. |
