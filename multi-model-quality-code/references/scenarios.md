# multi-model-quality-code — scenario playbooks

> Reference for the `multi-model-quality-code` skill. Load the block for the scenario the decision tree routed you to. Model mix percentages are guidance, not hard rules.

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

