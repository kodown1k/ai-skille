# multi-model-quality-code — cost & model-selection reference

> Reference for the `multi-model-quality-code` skill.
> **Pricing/model ids here are a snapshot and rot — verify current values via the `claude-api` skill before quoting cost or picking a model tier.**

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

