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

## Workflows by Scenario

### Scenario 1: Production Code Review (QUALITY-FIRST)

**When:** Code going to production, correctness matters, not specifically security/auth/payments.
**If the code is auth middleware or payment code, use Scenario 2b/2c instead.**

**Cost:** ~$0.50–$1.50/review depending on code size | **Time:** 10-15 min | **Quality:** 5/5

```
Step 1: SONNET INITIAL REVIEW (2 min, ~$0.05–$0.10)
────────────────────────────────────────────────────
Prompt:
"""
Review this code for obvious issues:
[paste code]

Focus on: correctness, readability, performance red flags.
Be concise. List top 5 issues if any.
"""

Step 2: OPUS DEEP DIVE (5 min, ~$0.30–$0.50)
─────────────────────────────────────────────
Prompt:
"""
Comprehensive security + architecture review of this code:
[paste code]

Context from Sonnet's initial review: [paste Sonnet findings]

Analyze:
1. Security vulnerabilities (OWASP top 10)
2. Architecture patterns (good/bad)
3. Maintainability
4. Edge cases missed

For each finding:
- Issue: [name]
- Severity: [critical/high/medium/low]
- Root cause: [why it exists]
- Fix: [how to patch]
- Confidence: [exploring/low/medium/high/certain]
"""

Step 3: O3 CRITICAL PATH VERIFICATION (5 min, ~$0.05–$0.15)
─────────────────────────────────────────────────────────────
Feed in Opus's findings first, then ask:
"""
Opus found these issues: [paste Opus findings]

Now trace through the critical path execution:
[paste code]

For each branch/condition:
- What happens in happy path?
- What could break it?
- Are there timing/ordering issues?
- Does Opus's assessment miss anything?

Give exact execution flow with potential failure points.
"""

Step 4: SYNTHESIS (2 min, ~$0.05)
───────────────────────────────────
Ask Sonnet:
"""
Given these findings from Opus and o3:
[paste both]

Rank all issues by: severity × confidence × fix effort.
Give me an ordered action list: what to fix first, what to defer.
"""
```

**Expected output:** Ranked fix list with multi-model confidence.

---

### Scenario 2: Security Audit (PARANOIA MODE)

**When:** Hardening code, security vulnerabilities, attack surface analysis.
**For payment code: use Scenario 2b. For auth/JWT code: use Scenario 2c.**

**Cost:** ~$0.50–$2.00 depending on code size | **Time:** 20 min | **Quality:** 5/5

**WARNING: Strip all live credentials and real PII before pasting to o3 (OpenAI) or Gemini (Google).**

```
Step 0: SCOPE THE TRUST BOUNDARY (5 min, no model needed)
──────────────────────────────────────────────────────────
Before auditing, map:
- Where does sensitive data enter?
- Where does it transit, rest, and leave?
- Which calls cross to external services?
- What is the attack surface perimeter?

Write a one-paragraph description. You'll feed this to each model.

Step 1: OPUS VULNERABILITY ENUMERATION (5 min)
───────────────────────────────────────────────
Prompt:
"""
Security audit. Trust boundary: [your Step 0 description]

[paste code]

Check: SQL injection, XSS, CSRF, auth bypass, authorization issues,
timing attacks, information leakage, race conditions, integer overflows,
path traversal, dependency vulnerabilities, insecure deserialization.

For each finding:
- Vulnerability: [name]
- Severity: [critical/high/medium/low] (based on impact × exploitability, not model consensus)
- Root cause: [why it exists]
- Exploit: [how an attacker would use it]
- Fix: [how to patch]
"""

Step 2: O3 ADVERSARIAL THINKING (5 min)
────────────────────────────────────────
Prompt:
"""
You're an attacker. Opus found these vulnerabilities: [paste Opus findings]

Now think adversarially about this code:
[paste code]

Walk through: entry points, attack vectors, specific payloads,
expected outcomes. Focus on what Opus missed or underestimated.
Be specific about exploit mechanics.
"""

Step 3: GEMINI ARCHITECTURAL REVIEW (5 min)
────────────────────────────────────────────
Prompt:
"""
Does the overall design permit these attacks?
[paste code + Opus findings + o3 adversarial analysis]

Focus: are these bugs or design flaws? Is the architecture itself
unsound, or are these patches sufficient? Suggest architectural fixes
where applicable.
"""

Step 4: SEVERITY-BASED CONSENSUS (5 min)
─────────────────────────────────────────
Create final security report.
NOTE: Severity = impact × exploitability. Use model agreement as
a confidence signal only — a single-model critical finding is still
critical. Do NOT downgrade severity because only one model caught it.

- Critical: [impact is catastrophic, exploitable now]
- High: [significant impact, reasonably exploitable]
- Medium: [limited impact or hard to exploit]
- Low: [informational / defense in depth]
- Model Agreement: [which models flagged each finding]

Step 5: GO/NO-GO GATE
──────────────────────
Define before launch: "Zero unremediated Critical or High findings."
Re-audit after fixes — fixes can introduce new bugs.
```

**Expected output:** Defense-in-depth security report with launch gate.

---

### Scenario 2b: Payment Processing Audit (PARANOIA MODE — PAYMENTS)

**When:** ANY code touching payment processing, credit cards, billing, refunds, or financial transactions.

**Cost:** ~$1.50–$3.00 | **Time:** 30 min | **Quality:** must be 5/5

**WARNING: Never paste real PANs, CVVs, or card data. Use test values only (e.g., 4111 1111 1111 1111). Strip PSP API keys before sharing with OpenAI or Google APIs.**

**The stakes framing:** A card-data breach means PCI fines, mandatory forensic audit, card-brand penalties, breach notification, chargebacks, and possible loss of payment processing ability — credibly six to seven figures, potentially company-ending. The model spend here is rounding error by comparison.

```
Step 0: MAP PCI SCOPE
──────────────────────
Answer these before auditing:
- Does the code ever handle raw PANs or CVVs? (it should not post-auth)
- Is tokenization in place? Who holds the token vault?
- Where do PSP API keys live? Are they in logs?
- Is this system reducing or expanding PCI scope?

Step 1: OPUS — PAYMENT DOMAIN AUDIT
──────────────────────────────────────
Prompt:
"""
Security audit of payment processing code.
[paste code — NO real card data]

Check ALL of the following:

PCI-DSS compliance:
- Is PAN (card number) ever stored post-authorization?
- Is CVV/CVV2 ever stored AT ALL? (prohibited even post-auth)
- Are full track data stored? (prohibited)
- Is cardholder data appearing in logs, debug output, error messages?

Tokenization:
- Is the raw PAN handled directly or via tokens?
- Is the tokenization provider trusted and in-scope?

Money arithmetic:
- Are amounts calculated using floating-point? (use integer cents/pence)
- Any rounding errors that could lose or gain money?
- Currency mismatch risks?
- Sign errors (negative amounts, refunds > original charge)?

Idempotency & double-charge:
- What happens on network timeout and retry?
- Is there an idempotency key on charge/capture calls?
- Can the same payment be charged twice?

Webhook integrity:
- Is the PSP webhook signature verified before processing?
- Is there replay protection (timestamp + nonce check)?
- What happens if a webhook arrives twice?

Auth-capture-refund state machine:
- Are authorization, capture, and refund state transitions enforced?
- Can a refund exceed the captured amount?
- Can a capture happen after void/cancel?
- Can amount or currency be tampered by client input?

Parameter tampering:
- Can a client influence the charged amount or currency?
- Is the amount authoritative on the server, not the client?

PSP secrets:
- Are PSP API keys and HMAC secrets stored securely?
- Could they appear in exceptions, stack traces, or logs?
"""

Step 2: O3 — ADVERSARIAL PAYMENT ATTACKS
──────────────────────────────────────────
Prompt:
"""
You're a fraudster attacking a payment system.
Opus found: [paste Opus findings]

Here is the payment code:
[paste code]

Focus on:
1. Can I charge a lower amount than shown to the user?
2. Can I replay a webhook to trigger a second delivery without paying?
3. Can I cause a race condition that results in double-delivery / no-charge?
4. Can I extract the PSP API key from error messages or logs?
5. Can I manipulate the refund flow to get money back I shouldn't?
6. Can I bypass idempotency to cause duplicate charges to someone else?

For each attack: entry point, payload, expected outcome, severity.
"""

Step 3: GEMINI — ARCHITECTURE & STATE MACHINE REVIEW
──────────────────────────────────────────────────────
Prompt:
"""
Payment system architecture review.
Findings so far: [paste Opus + o3 findings]
Code: [paste code]

Focus:
- Is the payment state machine correct and complete? Draw it.
- Are there design-level flaws that patches can't fix?
- Is PCI scope minimized? Could tokenization be used more aggressively?
- What does the failure/error path do with partial state?
"""

Step 4: SEVERITY REPORT + GO/NO-GO
────────────────────────────────────
Coverage checklist (confirm each is resolved):
- [ ] PAN never stored post-auth
- [ ] CVV never stored at all
- [ ] Amounts are integer arithmetic (no floats)
- [ ] Idempotency enforced on all charge/capture calls
- [ ] PSP webhook signatures verified + replay protection
- [ ] Amount is server-authoritative (no client amount trust)
- [ ] Auth-capture-refund state machine enforced
- [ ] PSP secrets not in logs or error responses
- [ ] Re-audit after fixes

Go/no-go: Zero unchecked items above + zero unremediated Critical/High findings.
```

---

### Scenario 2c: Authentication Security Audit

**When:** JWT middleware, session management, login/logout flows, token validation, OAuth handlers — especially going to production.

**Route here explicitly** if the user says "auth code going to production" or "authentication middleware review." Do NOT use Scenario 1 for this.

**Cost:** ~$0.50–$1.50 | **Time:** 15 min | **Quality:** must be 5/5

```
Step 1: OPUS — AUTH SECURITY CHECKLIST
─────────────────────────────────────────
Prompt:
"""
Security audit of authentication code.
[paste code]

Check ALL of the following:

JWT vulnerabilities:
- Algorithm confusion: does the server validate `alg` header?
- `none` algorithm: is it explicitly rejected?
- Key confusion: RS256 public key used as HS256 secret?
- Signature verification: is it actually happening, or just decoded?
- Claims validation: exp, nbf, iss, aud — all checked?

Session security:
- Session fixation: is session ID regenerated on login?
- Session invalidation: are tokens/sessions actually revoked on logout?
- Token expiry: are short-lived tokens used? Is expiry enforced server-side?
- Token revocation: is there a revocation mechanism (blocklist/allowlist)?

Credential handling:
- Timing-safe comparison: are passwords/tokens compared with constant-time function?
- Brute-force protection: rate limiting on auth endpoints?
- Password storage: bcrypt/argon2/scrypt with proper work factor?

Cookie security (if applicable):
- HttpOnly flag set?
- Secure flag set?
- SameSite attribute set?
- Domain scoped correctly?

CSRF protection:
- Are state-changing routes protected from CSRF?
- Double-submit cookie or CSRF token in place?

Fail-closed defaults:
- Does a missing/invalid token result in deny (not allow)?
- Are authorization checks fail-closed (deny by default)?
- Does an exception in auth middleware fail closed?
"""

Step 2: O3 — ADVERSARIAL AUTH ATTACKS
───────────────────────────────────────
Prompt:
"""
You're an attacker targeting an authentication system.
Opus found: [paste Opus findings]
Code: [paste code]

Try to:
1. Forge a valid JWT without the secret key
2. Use a valid token after the user logs out
3. Bypass the authentication check entirely via exception/edge case
4. Escalate privileges using a valid but lower-privilege token
5. Exploit timing to enumerate valid usernames

For each: specific technique, expected outcome, severity.
"""

Step 3: SYNTHESIS + GO/NO-GO
──────────────────────────────
Coverage checklist:
- [ ] JWT alg validated, `none` rejected
- [ ] Signature verified (not just decoded)
- [ ] All claims validated (exp, nbf, iss, aud)
- [ ] Session regenerated on login
- [ ] Tokens revocable and revocation enforced
- [ ] Timing-safe credential comparison
- [ ] Secure/HttpOnly/SameSite cookie flags
- [ ] Auth middleware fails closed on exception
- [ ] CSRF protection on state-changing routes

Go/no-go: Zero unchecked items + zero unremediated Critical/High.
```

---

### Scenario 3: Architecture Decision (THINK DEEP)

**When:** Choosing between two or more technical options (A vs B), not deciding whether to refactor/rebuild a legacy codebase.
**For refactor vs rebuild decisions, use Scenario 5b.**

**Cost:** ~$0.30–$0.80 | **Time:** 15 min | **Quality:** 5/5

```
Step 1: OPUS ARCHITECTURE THINKING (5 min)
───────────────────────────────────────────
Prompt:
"""
Design decision: [describe the decision]

Context:
- System handles [X load/scale]
- Team knows: [Y languages/frameworks]
- Constraints: [Z budget/time/maintenance]
- Options: [list all options, not just 2 — include the middle path]

For each option, analyze:
1. Implementation complexity (weeks needed?)
2. Operational complexity (how hard to run/maintain?)
3. Scaling properties (what breaks at 10x? 100x?)
4. Learning curve (how long for team?)
5. Reversibility (can we change our mind later?)
6. What could go wrong?

Recommend with confidence level and explicit uncertainties.
"""

Step 2: GEMINI EXTENDED THINKING (5 min)
─────────────────────────────────────────
Prompt:
"""
Deep analysis using extended thinking:
[repeat same problem + Opus's analysis]

Challenge Opus's recommendation:
- Is the recommended option actually reversible?
- What are the worst-case scenarios for each option over 3 years?
- What questions haven't been asked?
- Is there a fourth option that combines the best of both?

Return: thorough analysis + confidence + what Opus got wrong or right.
"""

Step 3: SYNTHESIS (5 min)
──────────────────────────
Compare Opus + Gemini reasoning.
Final recommendation: [chosen option + why].
Dissent: [where models disagreed and why it matters].
Decision criteria: [the 2-3 factors that swung the decision].
```

---

### Scenario 4: Large Codebase Analysis (MEGA FILES)

**When:** Codebase > 50K lines OR 5+ microservices where cross-service data flow matters.
**If codebase > 125K lines, use chunking strategy from Context Ceiling section above.**

**Cost estimate using token math:**
- 50K lines ≈ 400K tokens → ~$0.85 input (above 200K tier at $2/M)
- 80K lines ≈ 700K tokens → ~$1.47 input (above 200K tier)
- 125K lines ≈ 1M tokens → hits context ceiling, must chunk

**The reason to skip o3 for large codebases is its 200K context window — it can't hold a large codebase at all, not just cost.**

```
Step 1: PREPARE YOUR INPUT
────────────────────────────
For a single large codebase:
- Exclude: vendored dependencies, lockfiles (go.sum, package-lock.json),
  generated code, test fixtures, binary files
- Include: source files, API definitions, schema files, configuration

For microservices:
- Option A (cross-service analysis): concatenate all services with
  clear headers ("=== SERVICE: billing-service ===")
- Option B (per-service then synthesize): run each service through
  Gemini separately, collect summaries, then ask Gemini to synthesize

For polyglot repos (Go + Python, etc.):
- Note per-language entry points: Go (cmd/, main.go), Python (__main__, ASGI app)
- Point Gemini at inter-service contracts: gRPC .proto files, REST OpenAPI specs,
  message queue schemas — these are the architecture, not just the code

Step 2: GEMINI FULL LOAD (3-5 min)
────────────────────────────────────
Prompt:
"""
Analyze this codebase architecture:
[paste prepared input]

Return:
1. Architecture diagram (text-based, show service boundaries)
2. Data flow between major components (including external calls)
3. 3-5 major architectural patterns observed
4. Inter-service dependencies and coupling
5. Technical debt hotspots (by module/service, ranked)
6. Suggested improvements (prioritized by impact)
"""

Step 3: SONNET VALIDATION (2 min)
───────────────────────────────────
Prompt:
"""
Does this architecture analysis match the code?
[paste Gemini summary]
[paste 2-3 key source files that Gemini analyzed]

Quick validation: are the major components correct?
Any critical misunderstandings about data flow or service interactions?
"""
```

**Expected output:** Architecture overview with cross-service data flow and debt hotspots.

---

### Scenario 5: Refactoring (EXECUTION MODE)

**When:** You have specific code in front of you and want to make it cleaner/better.
**NOT for deciding WHETHER to refactor a legacy codebase. Use Scenario 5b for that.**

**Cost:** ~$0.20–$0.50 | **Time:** 20-30 min | **Quality:** 4/5

```
Step 1: SONNET RAPID ITERATION (10 min)
────────────────────────────────────────
Prompt:
"""
Refactor this code to [goal: better names / cleaner structure / remove duplication]:
[paste code]

Goal: improve readability without changing behavior.
Return: refactored code + reasoning.
"""

Step 2: OPUS DEEP REVIEW (5 min)
────────────────────────────────
Prompt:
"""
Review this refactor. Did it actually improve things or just rearrange?
Original: [paste original]
Refactored: [paste refactored]

Check: Did we lose any invariants? New bugs? Edge cases?
Any deeper patterns we missed?
"""

Step 3: ITERATE (5 min)
───────────────────────
If Opus found real problems: back to Sonnet with specific feedback.
If clean: proceed.

Step 4: GEMINI FINAL CHECK (optional, if > 500 lines changed)
───────────────────────────────────────────────────────────────
"""
Does the refactored structure make the codebase easier to maintain long-term?
Or did we just rearrange deck chairs?
"""
```

---

### Scenario 5b: Monolith Refactoring Decision (STRATEGY MODE)

**When:** "Should we refactor or rebuild this legacy system?" questions. Deciding, not doing.

The decision is almost never binary. The three options are:
1. **Refactor in place** — improve the existing codebase incrementally
2. **Strangler fig** — build new components alongside old, gradually strangle the monolith
3. **Full rebuild** — rewrite from scratch

The classic mistake: treating it as refactor-OR-rebuild and missing the strangler fig, which is the right answer for most large legacy systems.

**Cost estimate:** ~$0.50–$2.50 depending on codebase size fed to Gemini.
**The real cost:** person-months of engineering time. Have the models estimate that too, not just API spend.

```
Step 0: GATHER EVIDENCE FROM THE CODEBASE
──────────────────────────────────────────
Don't start with opinions. Start with metrics. Collect:
- Lines of code per module
- Test coverage % (or estimate)
- Dependency graph (which modules depend on which)
- Churn hotspots (git log --stat to find most-changed files)
- Dead code estimate
- External dependency age/health

If codebase fits in Gemini context (< 125K lines):
→ Feed it directly to Gemini in Step 1
If codebase > 125K lines (like a 200K-line monolith):
→ Use chunking: per-module summaries → meta-analysis

Step 1: GEMINI — CODEBASE EVIDENCE EXTRACTION
───────────────────────────────────────────────
Prompt:
"""
I'm deciding whether to refactor, do a strangler fig migration, or
rebuild this legacy codebase. I need evidence, not opinions.

[paste codebase or module summaries]

For each major module/component, tell me:
1. Coupling score: how many things depend on it? How many things does it depend on?
2. Cohesion: does this module have a clear single responsibility?
3. Test coverage indicators: are there tests? Are they meaningful?
4. Identified seams: where could this be cleanly extracted or replaced?
5. Domain knowledge concentration: is complex business logic embedded here?
6. Anti-patterns: God classes, circular dependencies, tangled state?

Based on this analysis: where are the natural bounded contexts?
Where are the strangler-fig seams?
"""

Step 2: OPUS — DECISION ANALYSIS
──────────────────────────────────
Feed Gemini's evidence to Opus:
"""
Legacy codebase analysis: [paste Gemini findings]

The system is [N] years old, [X] lines, described as "works but unmaintainable."

Analyze three options:
1. Refactor in place
2. Strangler fig migration (incremental parallel replacement)
3. Full rebuild

For each option, evaluate:
- Preconditions: what needs to be true to attempt this safely?
  (e.g., refactor requires test coverage, rebuild requires domain knowledge capture)
- Risk of domain knowledge loss: 10-year-old code has tribal knowledge embedded
- Business continuity: feature freeze risk during execution
- Reversibility: how hard to abandon mid-way?
- Team capacity: realistic timeline in person-months?
- Definition of done: how do you know it worked?

The classic trap: "never rewrite" (Spolsky) — most ambitious rebuilds fail because
the new system must handle all the edge cases the old one accumulated over years.

Recommend one of the three options with explicit go/no-go criteria.
"""

Step 3: SONNET — CHALLENGE + VALIDATE
───────────────────────────────────────
Prompt:
"""
Opus recommends [option] for this legacy system decision.
Evidence: [paste Gemini analysis]
Opus reasoning: [paste Opus recommendation]

Play devil's advocate:
- What's the strongest argument against Opus's recommendation?
- What are the 2-3 assumptions Opus made that could be wrong?
- Under what conditions would each of the other two options win?
"""

Step 4: DECISION RUBRIC
────────────────────────
Use this matrix to make the final call:

LEAN TOWARD REFACTOR when:
- Test coverage > 40% (can change safely)
- Clear module boundaries exist (low coupling)
- Team has deep domain knowledge
- No fundamental design flaws (bad code, not bad architecture)
- Business can't afford feature freeze

LEAN TOWARD STRANGLER FIG when:
- Clear seams between components exist
- Some modules are fine, some are disasters
- Team can build new and maintain old simultaneously
- External API/interface is stable (new replaces old incrementally)
- This is the default recommendation for most 50K+ line monoliths

LEAN TOWARD REBUILD when:
- Architecture is fundamentally broken (circular dependencies everywhere)
- Test coverage < 5% and domain knowledge is well-documented externally
- Technology platform is end-of-life and no upgrade path exists
- Team turnover means NO ONE knows why it works
- Regulatory/security requirements make the old codebase non-fixable

GO/NO-GO GATE FOR ANY OPTION:
- [ ] Team agrees on which option
- [ ] Domain knowledge captured (regardless of option)
- [ ] Success metrics defined (what "done" looks like)
- [ ] Rollback plan exists
- [ ] Executive alignment on timeline and freeze costs
```

---

### Scenario 6: Performance Optimization

**Cost:** ~$0.30–$1.50 | **Time:** 15 min | **Quality:** 4/5

```
Step 1: SONNET PROFILING IDEAS (3 min)
───────────────────────────────────────
Prompt:
"""
This code is slow. Bottleneck is in [function X].
[paste code]

Quick ideas: what could we optimize without rewriting?
Suggest 3-5 low-effort wins.
"""

Step 2: O3 ALGORITHMIC ANALYSIS (5 min)
────────────────────────────────────────
Prompt:
"""
Current algorithm is O(n²). Can we improve?
[paste code]

Walk through: what's the constraint? Can we precompute?
Use different data structure? Parallelize?

Show exact algorithmic improvement (O(n log n)? O(n)?).
"""

Step 3: IMPLEMENTATION + VERIFICATION (5 min)
──────────────────────────────────────────────
Sonnet implements the optimization.
Sonnet verifies: does optimized code preserve behavior?
Quick check for off-by-one, edge cases.
```

---

## Cost Matrix (realistic estimates)

Costs below use token math at current rates. Ranges reflect code size variation.

| Scenario | Models | Cost Range | When Worth It |
|----------|--------|-----------|---------------|
| Quick fix | Sonnet | ~$0.02–$0.10 | Always (baseline) |
| Standard code | Sonnet | ~$0.05–$0.20 | Always |
| Production review | Opus + o3 + Sonnet | ~$0.50–$1.50 | Always for prod code |
| Security audit | Opus + o3 + Gemini | ~$0.50–$2.00 | Critical systems |
| Payment audit | Opus + o3 + Gemini | ~$1.50–$3.00 | ALWAYS for payment code (vs $1M+ breach) |
| Auth audit | Opus + o3 | ~$0.30–$1.00 | Always for auth going to prod |
| Architecture | Opus + Gemini | ~$0.30–$1.00 | Major decisions |
| Monolith decision | Gemini + Opus + Sonnet | ~$0.50–$2.50 | 50K+ line legacy systems |
| Mega codebase (50K lines) | Gemini + Sonnet | ~$1.00–$2.00 | > 50K lines |
| Mega codebase (80K lines) | Gemini + Sonnet | ~$1.50–$2.50 | Large codebases |
| Refactoring | Sonnet + Opus | ~$0.20–$0.50 | Major changes |
| Performance | Sonnet + o3 | ~$0.30–$1.50 | Performance-critical |
| Consensus (max quality) | Sonnet + o3 + Gemini | ~$2.00–$4.00 | Highest confidence |

---

## Prompt Templates (Copy-Paste Ready)

### Template: Production Code Review
```
Role: You are a critical code reviewer for production systems.

Review this code for:
1. Correctness (will it work? all edge cases handled?)
2. Security (vulnerabilities, injection points, auth)
3. Performance (O(n²)? Unnecessary allocations? DB queries in loop?)
4. Maintainability (clarity, naming, future-proofing)
5. Testing (what tests are missing?)

[CODE]

Format your response as:
## Critical Issues (MUST FIX)
## High Priority (SHOULD FIX)
## Nice to Have (COULD FIX)
## Confidence: [exploring/low/medium/high/certain]
```

### Template: Security Audit (Generic Web App)
```
Role: You are a security auditor looking for vulnerabilities.
Mindset: "Assume this is live. I'm trying to break it."

Audit this code for:
- SQL injection / NoSQL injection
- XSS / CSRF
- Authentication bypasses
- Authorization issues (IDOR, privilege escalation)
- Timing attacks
- Information disclosure
- Race conditions
- Integer overflows
- Path traversal
- Dependency vulnerabilities

[CODE]

For each finding:
- Vulnerability: [name]
- Severity: [critical/high/medium/low] based on impact × exploitability
- Root cause: [why it exists]
- Exploit: [how an attacker would use it]
- Fix: [how to patch it]

## Summary: Total vulnerabilities: [N] critical, [M] high
```

### Template: Payment Processing Audit
```
Role: You are a payment security auditor with PCI-DSS expertise.
Mindset: "Real money. Real cards. Find everything."

[CODE — no real PANs, CVVs, or secrets]

Audit specifically for:

PCI-DSS compliance:
- PAN stored post-authorization? (prohibited)
- CVV/CVV2 stored at all? (prohibited)
- Cardholder data in logs/errors?

Money arithmetic:
- Floating-point used for amounts? (must use integer cents)
- Rounding errors? Currency mismatches? Sign errors?

Idempotency:
- Idempotency keys on all charge/capture calls?
- What happens on timeout + retry? Double charge possible?

Webhook integrity:
- PSP signature verified? Replay protection?
- What if webhook arrives twice?

Parameter tampering:
- Can client influence charged amount or currency?
- Is amount server-authoritative?

Auth-capture-refund state machine:
- State transitions enforced?
- Refund > original capture possible?
- Void after capture possible?

For each finding: Vulnerability / Severity / Exploit / Fix
```

### Template: Authentication Security Audit
```
Role: You are an authentication security specialist.
Mindset: "Find every way to bypass, forge, or escalate."

[CODE]

Audit for:

JWT vulnerabilities:
- alg header validated? `none` algorithm explicitly rejected?
- Signature actually verified (not just decoded)?
- All claims validated: exp, nbf, iss, aud?

Session security:
- Session ID regenerated on login? (fixation prevention)
- Tokens revocable on logout?
- Token expiry enforced server-side?

Credential handling:
- Timing-safe comparison (constant-time function)?
- Rate limiting on auth endpoints?
- Secure password storage (bcrypt/argon2)?

Cookie security:
- HttpOnly, Secure, SameSite attributes set?

Fail-closed:
- Missing/invalid token → deny (not allow)?
- Auth exceptions fail closed?

CSRF: state-changing routes protected?

For each finding: Vulnerability / Severity / Exploit / Fix
```

### Template: Architecture Decision
```
Role: You are a system architect making long-term design decisions.

Decision: Should we use [OPTION A] or [OPTION B]? (Consider if there's a third path.)

Context:
- Scale: [current users/requests]
- Growth: [expected in 1-3 years]
- Team: [5 devs, 2 years Go experience]
- Constraints: [6-month timeline, $500K budget]

For each option, analyze:
1. Implementation complexity (weeks needed?)
2. Operational complexity (how hard to run/maintain?)
3. Scaling properties (what breaks at 10x? 100x?)
4. Learning curve (how long for team?)
5. Reversibility (can we change our mind later?)
6. What could go wrong?

## Recommendation: [OPTION]
## Confidence: [low/medium/high]
## Reasoning: [synthesized]
## What we might be wrong about: [...]
## If we're wrong: [what to watch for]
```

### Template: Monolith Refactoring Decision
```
Role: You are a software architect advising on legacy system strategy.

The system: [N] years old, [X] lines of code, [language], [brief description]
Current state: [what works, what doesn't, why it's unmaintainable]

Evidence to analyze:
[paste code, metrics, or module summaries]

Evaluate THREE options (not two):
1. Refactor in place
2. Strangler fig migration
3. Full rebuild

For each option:
- Preconditions for success
- Domain knowledge risk (10-year systems have tribal knowledge)
- Business continuity impact (feature freeze cost)
- Timeline in person-months (realistic, not optimistic)
- Reversibility if it fails mid-way
- Success criteria

Classic traps to call out:
- "We'll rebuild it right this time" (rebuilds rarely succeed)
- "We'll refactor incrementally" (without seams or tests, this is impossible)
- Missing the strangler fig option entirely

Recommend one option. State what would have to be true for each other option to win instead.
```

---

## Checklist: When to Use Which Model

**Use Sonnet 4.6 when:**
- [ ] You're iterating fast (< 30 sec per round trip needed)
- [ ] It's routine code (CRUD, standard patterns)
- [ ] Low cost needed (< $0.10)
- [ ] Latency is critical (< 2s response)

**Use Opus 4.8 when:**
- [ ] Code will be in production for years
- [ ] Security/correctness critical
- [ ] Complex decision needed
- [ ] You can wait 5-10 seconds
- [ ] Cost is secondary to quality

**Use o3 when:**
- [ ] Logic puzzle / race condition / proof needed
- [ ] Adversarial thinking needed (attacker mindset)
- [ ] Hard reasoning beats brute-force checking
- NOTE: 200K context limit — cannot handle large codebases

**Use Gemini 2.5-Pro when:**
- [ ] Codebase > 20K lines (Sonnet/Opus can't hold it in one pass)
- [ ] Cross-service architecture analysis needed
- [ ] Extended thinking needed (30+ min of analysis)
- [ ] You need to analyze a screenshot/diagram
- [ ] NOTE: >200K tokens → costs $2/M input (not $1/M). >1M tokens → chunk first.

**Use Multi-Model Consensus when:**
- [ ] Highest confidence needed
- [ ] Security/correctness critical
- [ ] Final decision is hard (needs multiple perspectives)
- [ ] You can afford the time/cost ($2–$4)

---

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

**Before you start, verify keys are loaded:**
```bash
cd ~/zen-mcp-server
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
