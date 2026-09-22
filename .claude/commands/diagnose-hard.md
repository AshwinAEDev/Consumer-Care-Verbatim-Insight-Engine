---
description: RCA - Critical Issue
---

Target: $ARGUMENTS

## 1. Root Cause Identification

Location: [file:line] in [function]()

Broken Contract: [Explicit statement of violated invariant]

Problem: [Statement of exact failure point]

Why: [Detailed mechanism explanation]

Causation chain: [A → B → C (failure)]

## 2. Blast Radius Assessment

Impact Scope: [LOCALIZED | MODULE-LEVEL | SYSTEM-WIDE]

All callers: [Complete list with impact for each]
All consumers: [Complete list with impact for each]
Shared state/schemas affected: [Detailed list]
Data integrity impact: [Records at risk? Schemas violated?]
Sibling vulnerabilities: [Are related code paths affected?]

Affected services: [List all downstream systems]
Affected users/data: [Estimate of scope]

## 3. Failure Modes (Detailed)

Mode A: [Concrete failure scenario]
  Trigger: [Exact conditions]
  Observable outcome: [What user/system sees]
  Boundary conditions: [When does this manifest?]
  Frequency: [How often?]

Mode B: [...]

## 4. Evidence

Code context: [15–20 lines with full context]

Stack trace / logs: [Complete trace]

Observable symptoms:
  • Actual behavior: [What happened]
  • Expected behavior: [What should happen]
  • Data corruption: [If applicable]

Reproduction steps: [Numbered, deterministic]

Verification approach: [How to confirm]

## 5. Proposed Repair Strategy

Repair location: [Files, functions, schema changes]

Repair abstraction: [Where in the stack]

Conceptual approach: [Option A | Option B | Option C with tradeoffs]

Why it works: [How it restores the broken contract]

Side effects: [All consequences, including backward compat]

Rollback plan: [If fix introduces problems]

## 6. Impact Analysis

Risk level: [CRITICAL | HIGH | MEDIUM | LOW]

Justification: [Why this risk level]

Data at risk: [Records, users, financial impact, etc.]

Availability impact: [System downtime? Degradation?]

Security impact: [Is this exploitable? By whom?]

## 7. Confidence

Level: [1–5]

Justification: [Why this level; what evidence]

Verification status: [What's been tested? What remains?]

Next steps (if <5): [What additional verification needed]

## 8. Sources & References

Code files: [Exact paths and line ranges]
External specs: [RFC, schema, API contract]
Related issues: [Issue #, PR #, prior incidents]
Logs: [Links or timestamps]