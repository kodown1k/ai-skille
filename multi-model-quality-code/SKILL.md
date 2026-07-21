---
name: multi-model-quality-code
description: |
  Use this skill for high-stakes or high-complexity code tasks where a single model's blind spots could be costly. TRIGGER on: payment processing, billing, auth/authorization, security audits, cryptography, or any code handling money or credentials; production-readiness reviews of non-trivial code (100+ lines or unclear scope — when in doubt, trigger); architecture decisions (refactor vs. rebuild, monolith decomposition, microservices migration, legacy system analysis); race conditions, concurrency bugs, or distributed-systems correctness; large or unfamiliar codebases (10K+ lines, or when user says "monolith", "legacy", "inherited", "big repo"); performance bottlenecks in hot paths; any time the user asks for "consensus", "multiple perspectives", "second opinion", "verify", "validate", or "sanity check" on code. Killer features: multi-model consensus (Sonnet + Opus + o3 + Gemini vote on findings, disagreements surfaced), 1M-token context for whole-repo analysis, o3 deep reasoning for logic/proof-level correctness, automatic cost optimization (cheap models triage, expensive models handle high-risk findings). Do NOT trigger for: routine snippets under ~100 lines, or when user has already chosen a single model.
compatibility: PAL MCP server (zen-mcp-server) with OpenAI + Gemini API keys
---

# Multi-Model Quality Code Strategy

Your AI dev team: **Sonnet 4.6 (speed) + Opus 4.8 (depth) + o3 (reasoning) + Gemini 2.5-Pro (context)**.

This skill helps you orchestrate these models to achieve the best code quality, fastest development, and optimal cost. Use it when you want more than one model's opinion or when a task specifically needs a model's unique strength.

---

## WARNING: Data Egress — Read Before Pasting Code

**NEVER paste real secrets, card data (PANs, CVVs), or PII to these models.**

When you use o3 via OpenAI API, your code goes to OpenAI's servers. When you use Gemini, it goes to Google's servers. For payment code, auth code, or any code touching sensitive data:
1. Strip live API keys, tokens, and credentials before sharing.
2. Replace real card numbers with fake ones (4111 1111 1111 1111 is a standard test PAN).
3. Be aware: you are shipping source code to two third-party providers.

This is not theoretical — a security skill that ignores its own data egress fails the paranoia test.

---

## Context Ceiling Warnings

Before picking a model, estimate your token budget. Rule of thumb: **~8–12 tokens per line of code**.

| Model | Context Window | Max Lines (rough) | Pricing Tier Boundary |
|-------|---------------|-------------------|----------------------|
| **Sonnet 4.6** | 200K tokens | ~20K–25K lines | — |
| **Opus 4.8** | 200K tokens | ~20K–25K lines | — |
| **o3** | 200K tokens | ~20K–25K lines | — |
| **Gemini 2.5-Pro** | 1M tokens | ~100K–125K lines | 200K token tier: below = cheaper, above = more expensive |

**Critical thresholds:**
- **>20K lines → only Gemini can hold it in one pass.** Sonnet/Opus need 3–5 chunks.
- **>80K lines → you're pushing Gemini's budget.** 80K lines ≈ 600K–950K tokens — still fits in 1M but costs at the higher tier.
- **>125K lines → exceeds Gemini's 1M context.** Use map-reduce: summarize per module/service, then feed summaries to Gemini for meta-analysis.
- **200K lines → ~2–3M tokens.** Does NOT fit in one Gemini pass. Plan for chunking.

**Chunking strategy for oversized repos:**
```
1. Split by module/service/bounded context
2. Run Gemini (or Opus) on each chunk: "Summarize this module's API surface, dependencies, and tech-debt hotspots."
3. Collect summaries (~500–2K tokens each)
4. Feed all summaries to Gemini: "Given these module summaries, analyze the overall architecture."
```

---

## Quick Decision Tree (Scenario Router)

**What's your task? Find the FIRST match and use that scenario.**

```
Is the code going to a LIVE payment/billing/financial system?
   └─ YES → Scenario 2b: Payment Processing Audit (regardless of other labels)

Is the code authentication / session / token / JWT middleware?
   AND it's going to production soon?
   └─ YES → Scenario 2c: Authentication Security Audit (NOT Scenario 1)

Is the task about security vulnerabilities / hardening / attack surface?
   └─ YES → Scenario 2: Security Audit (PARANOIA MODE)

Is the codebase > 50K lines (or 15+ microservices)?
   └─ YES → Scenario 4: Large Codebase Analysis (Gemini-first)

Are you DECIDING whether to refactor/rebuild a legacy monolith?
   └─ YES → Scenario 5b: Monolith Refactoring Decision (NOT Scenario 5)

Are you EXECUTING a refactor on specific code you have in front of you?
   └─ YES → Scenario 5: Refactoring (ITERATION → VERIFY)

Is it an architecture design choice between options (A vs B)?
   └─ YES → Scenario 3: Architecture Decision

Does the code have a race condition / concurrency bug / hard logic puzzle?
   └─ YES → Use o3 alone. No other model needed.

Is the code going to production (correctness/edge cases matter)?
   └─ YES → Scenario 1: Production Code Review

Otherwise:
   └─ Quick task → Sonnet. Important task → Scenario 1.
```

---

## Model Quick Reference

| Model | Speed | IQ | Context | Cost/1M tokens | Best For |
|-------|-------|----|---------|----|----------|
| **Sonnet 4.6** | Fast | Good | 200K | ~$3 in / $15 out | Daily work, iteration loops |
| **Opus 4.8** | Slow | Best | 200K | ~$15 in / $75 out | Deep reviews, architecture |
| **o3** | Slow | Best | 200K | ~$2 in / $8 out | Hard reasoning ONLY |
| **Gemini 2.5-Pro** | Medium | Best | **1M** | $1/$2 in (≤/> 200K) / $10/$15 out | Mega files, thinking, vision |

**Cost estimates using token math:**
- Typical code snippet (2K tokens in + 1K out): Sonnet ~$0.02, Opus ~$0.11, o3 ~$0.01
- Typical deep review (10K in + 3K out): Sonnet ~$0.08, Opus ~$0.38, o3 ~$0.04
- 50K-line codebase via Gemini (~400K tokens in + 5K out): ~$0.85 (above 200K tier)
- 80K-line codebase via Gemini (~700K tokens in + 5K out): ~$1.47 (entirely above 200K tier)

These are estimates. For accurate budgeting: `tokens_in * rate_in / 1M + tokens_out * rate_out / 1M`.

---


## Detailed playbooks (load on demand)

The per-scenario walkthroughs, copy-paste prompt templates, and cost/model-selection detail
are kept out of this always-loaded body — open the reference for the scenario the decision tree
routed you to:

- **[references/scenarios.md](references/scenarios.md)** — full step-by-step for all 9 scenarios: production review, security / payment / auth audits, architecture decision, mega-file analysis, refactoring, monolith-split, performance.
- **[references/templates.md](references/templates.md)** — copy-paste prompt templates per scenario.
- **[references/cost-model.md](references/cost-model.md)** — cost matrix + per-model selection checklist. **Verify current model ids/pricing via the `claude-api` skill before quoting — the numbers there are a snapshot, not live.**
## Your Workflow (Recommended Mix)

### Daily Development
```
75% Sonnet 4.6      → Fast iteration, features, bugs
20% Gemini 2.5      → Large files, extended analysis
 5% Opus 4.8        → Architecture decisions only
 0% o3              → (skip unless race condition or adversarial)
```

### Code Review
```
50% Sonnet (quick take)
25% Opus (depth)
25% o3 (if security/complexity)
```

### Architecture Planning
```
60% Opus (deep thinking)
30% Gemini (extended thinking + context)
10% Sonnet (quick sanity check)
```

### Security Audit
```
40% Opus (vulnerabilities)
40% o3 (adversarial thinking)
20% Gemini (architecture consequences)
```

---

## Integration with PAL MCP

**Preflight — verify the zen/PAL MCP server exists on THIS host, then that keys are loaded.**
This skill depends on an external multi-model MCP server (zen-mcp / PAL) that is NOT guaranteed to
be present on every machine (the path below was previously hardcoded to another machine's home). If
it is missing or unreachable here, **stop and say so** rather than failing mid-workflow — the honest
fallback is to run the review single-model and flag that cross-model consensus was unavailable.
```bash
ZEN_MCP_DIR="${ZEN_MCP_DIR:-$HOME/zen-mcp-server}"   # override for this host if checked out elsewhere
[ -d "$ZEN_MCP_DIR" ] || { echo "zen/PAL MCP not found at $ZEN_MCP_DIR — configure it or fall back to single-model"; exit 1; }
cd "$ZEN_MCP_DIR"
timeout 5 python server.py 2>&1 | grep -E "OPENAI|GEMINI"
```

Expected output:
```
OPENAI_API_KEY: [PRESENT]
GEMINI_API_KEY: [PRESENT]
```

**Command examples:**
```
Use sonnet to code this feature
Use opus for security review
With o3, trace the race condition
Use gemini-2.5-pro to analyze this mega repo
Get consensus from sonnet, o3, and gemini on architecture
```

### Context Passing Between Models

When chaining models, always pass prior findings forward — verification steps should verify, not re-discover:
```
Step N+1 prompt: "Model X found these issues: [paste findings].
Now look at [code] and verify/extend/challenge those findings."
```

---

## Pro Tips

1. **Context Ceiling First:** Before picking a model, estimate your token count (lines * 10). If it's near a model's limit, pick a bigger model or plan chunking.

2. **Parallel Thinking:** Don't use o3 on small tasks. Its 200K context limit means it can't hold large codebases. Reserve it for reasoning puzzles and adversarial analysis.

3. **Gemini for Size — With Pricing Awareness:** Gemini 2.5-Pro's 1M context is unique. But >200K tokens bills at $2/M input, not $1/M. For an 80K-line codebase: expect ~$1.50–$2.50 total, not $0.30–$0.40.

4. **Payment/Auth Code = Domain Templates:** Generic OWASP checklists miss payment-specific bugs (double charge, CVV storage, amount tampering) and auth-specific attacks (JWT alg confusion, none algorithm). Use Scenario 2b/2c.

5. **Severity vs Consensus:** A finding from one model can still be Critical. Model agreement is a confidence signal, not a severity multiplier. Don't bury single-model Critical findings.

6. **Strangler Fig Default:** For legacy monolith decisions, the answer is usually strangler fig, not refactor-or-rebuild. Make sure models consider all three options.

7. **Strip Credentials Always:** Before any code goes to OpenAI or Google APIs, verify no live keys, real card data, or PII are in the paste.

---

## When to Invoke This Skill

Ask for this skill when:
- You're about to do a code review and want quality
- Refactoring production code (or deciding whether to)
- Making architecture decisions
- Security audits needed (especially auth or payment code)
- Large codebase analysis (> 50K lines or microservices)
- You want consensus from multiple AI perspectives
- Wondering "which model should I use?"
- Building critical systems

**Don't invoke if:** Just need quick code (Sonnet is already your best friend).
