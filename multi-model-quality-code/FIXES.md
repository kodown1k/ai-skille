# FIXES.md — multi-model-quality-code Skill (Iteration 2 → 3)

**Date:** 2026-06-08
**Source:** Opus 4.8 evaluations of evals 1–4 (iteration 2)
**Overall eval scores before fixes:** 3.4/5, 2.6/5, 2.5/5 across test cases

---

## Fix 1: Cost Math — Broken Pricing

**Problem (from evals 2, 3, 4):**
- Gemini full load of 80K lines was quoted as `$0.30`. Actual cost: ~$1.47 input alone, because 80K lines ≈ 700K tokens which is above the 200K token pricing tier. The skill's own ">50K lines" trigger guaranteed the user was in the expensive tier, yet quoted the cheap-tier price — off by 5–6x.
- o3 was quoted as "$10+" for large codebases. Current o3 pricing is ~$2/$8 per 1M in/out. The real reason to skip o3 for large codebases is the 200K context limit (can't hold the codebase), not cost.
- Scenario 1 had three different cost figures for the same workflow: $1.50 header, $1.45 step-sum, $0.50 matrix.
- Dollar figures like `$1.50` were being mangled on render to `have.50` etc. — the skill used `$` before digits which some renderers treat as variable interpolation.

**Fixes applied:**
- Replaced all fixed dollar amounts with token-derived ranges using formula: `tokens * rate / 1M`.
- Added a cost model note explaining the formula.
- Added the 200K tier boundary explicitly: Gemini charges $1/M below 200K tokens, $2/M above.
- Corrected o3 pricing to ~$2/$8, and stated the real reason to skip it for large codebases (context limit, not cost).
- Reconciled cost matrix — all figures now use the same token-math basis.
- Replaced `$<digit>` patterns with `~$<digit>` ranges to avoid interpolation issues.

---

## Fix 2: Domain-Specific Templates

**Problem (from evals 1, 3):**
- The security template was generic OWASP web-app checklist. For payment code, this misses the entire payment-specific bug class: CVV storage, double-charge/idempotency, amount tampering, webhook replay, PAN handling, money arithmetic. A developer running the generic template on payment code would feel audited while the actual payment bugs went unprompted.
- For auth code, the generic template misses JWT-specific attacks (alg confusion, `none` algorithm), session fixation, timing-safe comparison, fail-closed defaults.

**Fixes applied:**
- Added **Scenario 2b: Payment Processing Audit** with a complete PCI-DSS scope step, PAN/CVV storage checks, money arithmetic (float vs integer), idempotency/double-charge, webhook signature + replay, auth-capture-refund state machine, amount/currency tampering, and a coverage checklist with go/no-go gate.
- Added **Scenario 2c: Authentication Security Audit** with JWT-specific checks (alg validation, `none` rejection, signature verification, claims validation), session fixation, token revocation, timing-safe comparison, secure cookie flags, fail-closed defaults, CSRF protection.
- Added corresponding copy-paste prompt templates for both: **Template: Payment Processing Audit** and **Template: Authentication Security Audit**.
- Added **Template: Monolith Refactoring Decision** (see Fix 4).

---

## Fix 3: Scenario Routing — Ambiguity Reduction

**Problem (from evals 1, 4):**
- "Auth middleware going to production" legitimately mapped to both Scenario 1 (Production Review) and Scenario 2 (Security Audit). A top-down reader would hit Scenario 1 first and use the weaker, Sonnet-first workflow for a security-critical case.
- "200K lines: refactor or rebuild" mapped to both Scenario 3 (Architecture Decision) and Scenario 5 (Refactoring), with Scenario 5 telling Sonnet to "return refactored code" — meaningless for a strategic decision.
- No explicit routing between scenarios.

**Fixes applied:**
- Replaced the Quick Decision Tree with a priority-ordered router using explicit "route here if" conditions.
- Added explicit routing: "auth code going to production → Scenario 2c, NOT Scenario 1"
- Added explicit routing: "deciding whether to refactor/rebuild → Scenario 5b, NOT Scenario 5"
- Added explicit routing: "payment code → Scenario 2b regardless of other labels"
- Renamed and clarified scenario subtitles to make scope unambiguous (EXECUTION MODE vs STRATEGY MODE).
- Added router note at top of Scenario 5 pointing decision-stage users to Scenario 5b.

---

## Fix 4: Context Ceiling Warnings

**Problem (from evals 2, 4):**
- No token-budget reasoning anywhere. The skill never estimated whether 80K lines fits in 1M tokens. For 200K lines (a 200K-line monolith), this exceeds even Gemini's 1M context — requiring chunking — but the skill never mentioned this.
- No fallback strategy for when a codebase exceeds the context window.

**Fixes applied:**
- Added a top-level **Context Ceiling Warnings** section with a table of all four models' context limits in both tokens and approximate lines.
- Added critical thresholds: >20K lines (only Gemini fits in one pass), >80K lines (near Gemini's cost ceiling), >125K lines (must chunk), 200K lines (2–3M tokens, does not fit in Gemini at all).
- Added a concrete **chunking strategy**: split by module/service, summarize each chunk, feed summaries to Gemini for meta-analysis.
- Added rule of thumb: ~8–12 tokens per line of code.
- Added token math examples for 50K and 80K line codebases.

---

## Fix 5: Decision Rubric for Refactoring

**Problem (from eval 4):**
- Scenario 3 (Architecture Decision) and Scenario 5 (Refactoring) both partially matched "refactor vs rebuild" but neither gave an actual decision framework. The synthesis step was "compare Opus + Gemini reasoning" — a vague merge instruction, not a decision rubric.
- The skill framed every decision as binary (Option A vs Option B), missing the strangler fig as a third option — which is the textbook answer for most large legacy systems.
- No go/no-go gates, no success criteria, no "lean toward X when" guidance.

**Fixes applied:**
- Added **Scenario 5b: Monolith Refactoring Decision** as a separate scenario from Scenario 5 (which is for executing a refactor on code you have in front of you).
- Scenario 5b introduces all three options explicitly: refactor in place, strangler fig, full rebuild.
- Added a **Decision Rubric** section with "lean toward X when" criteria for each of the three options, based on test coverage, coupling, domain knowledge risk, business continuity, and architecture soundness.
- Added go/no-go gate: team alignment, domain knowledge captured, success metrics defined, rollback plan.
- Added Gemini step for evidence extraction from the codebase (coupling, seams, test coverage indicators) to ground the decision in actual code, not just opinions.
- Added note about engineering-effort cost (person-months) being the real decision cost, not just API token spend.
- Added the classic "never rewrite" trap (Spolsky) and "refactor without seams" trap explicitly.

---

## Fix 6: Data Egress Warning

**Problem (from eval 3):**
- The skill advises pasting payment/auth code to o3 (OpenAI API) and Gemini (Google API) but never warned about data egress. A security skill that ignores its own data-handling risk fails the paranoia test.

**Fixes applied:**
- Added a prominent **WARNING: Data Egress** section near the top of the skill (before the decision tree).
- Warning covers: never paste real PANs, CVVs, secrets, or PII; strip live API keys before sharing; o3 = OpenAI servers, Gemini = Google servers.
- Repeated the warning at the top of Scenario 2 (Security Audit), Scenario 2b (Payment Audit), and in Pro Tips.

---

## Fix 7: Severity vs Consensus Clarification

**Problem (from eval 3):**
- The consensus step used: "Critical = all 3 models agreed, Medium = single mention." This conflates consensus (confidence signal) with severity (impact × exploitability). A single-model critical finding (e.g., CVV stored post-auth) would be filed as Medium — actively dangerous for payment/auth code.

**Fixes applied:**
- Updated Step 4 of Scenario 2 with an explicit note: "Severity = impact × exploitability. Use model agreement as a confidence signal only — a single-model critical finding is still critical."
- Added this principle to Scenario 2b and 2c coverage checklists.
- Added Pro Tip 5: "A finding from one model can still be Critical. Model agreement is a confidence signal, not a severity multiplier."

---

## Fix 8: Context Passing Between Steps

**Problem (from eval 1):**
- Verification steps (Step 3: o3) didn't instruct the user to feed in prior findings. Later models re-discovered rather than verified.
- No synthesis prompt template — the step where multi-model value is realized was the least prescribed.

**Fixes applied:**
- Updated all multi-step workflows so each step explicitly receives prior findings: "Opus found these issues: [paste]. Now verify/extend/challenge."
- Added a "Context Passing Between Models" section in PAL MCP integration with example pattern.
- Synthesis step in Scenario 1 now uses Sonnet with both Opus + o3 findings explicitly.

---

## What Was Preserved

- Overall structure: decision tree → model reference → scenarios → cost matrix → templates → checklists → PAL MCP
- All six original scenarios (1, 2, 3, 4, 5, 6) — Scenarios 2b, 2c, 5b are additions
- Model Quick Reference table
- PAL MCP integration section and command examples
- Workflow percentage breakdowns (Daily Development, Code Review, etc.)
- All original pro tips (toned down "magically knows" to be more accurate)
- The three-angle model role design in Scenario 2 (Opus=enumeration, o3=adversarial, Gemini=architectural) which eval 3 rated as the skill's strongest asset

---

## Summary of Changes by File Section

| Section | Change Type | Reason |
|---------|-------------|--------|
| New: Data Egress Warning | Added | Eval 3: security skill must address own data handling |
| New: Context Ceiling Warnings | Added | Evals 2, 4: no token-budget reasoning, no ceiling warning |
| Quick Decision Tree | Replaced | Evals 1, 4: ambiguous routing between overlapping scenarios |
| Model Quick Reference | Updated | Eval 2: costs were wrong, added token math column |
| Scenario 1 | Updated | Eval 1: reconciled cost figures, added context-passing |
| Scenario 2 | Updated | Eval 3: severity vs consensus fix, added Step 0 scope + go/no-go |
| New: Scenario 2b | Added | Eval 3: payment-domain template entirely missing |
| New: Scenario 2c | Added | Eval 1: auth-specific template entirely missing |
| Scenario 3 | Updated | Eval 4: clarified scope (A vs B decisions, not refactor/rebuild) |
| Scenario 4 | Updated | Eval 2: cost math, polyglot/microservice handling, chunking |
| Scenario 5 | Updated | Eval 4: clarified as EXECUTION only, added router to 5b |
| New: Scenario 5b | Added | Eval 4: refactor-vs-rebuild decision entirely missing |
| Cost Matrix | Rebuilt | Evals 2, 3, 4: all figures were wrong, now token-derived ranges |
| New: Payment Template | Added | Eval 3: generic OWASP misses all payment-specific bugs |
| New: Auth Template | Added | Eval 1: generic OWASP misses JWT/session/fail-closed |
| New: Monolith Template | Added | Eval 4: no template for legacy system decision |
| Pro Tips | Updated | Evals 1, 2: "magically knows" toned down, cost awareness added |
