# multi-model-quality-code — copy-paste prompt templates

> Reference for the `multi-model-quality-code` skill. Paste the template for your scenario into the target model.

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

