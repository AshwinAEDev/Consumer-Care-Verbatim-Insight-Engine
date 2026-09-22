---
description: Quick RCA - Simple Bug
---

Target: $ARGUMENTS

## 1. Root Cause Identification

Location: [file:line] in [function]()

Broken Contract: [What invariant was violated? What assumption failed?]
Example: "The code assumes token.exp is in milliseconds, but RFC 7519 defines it in seconds."

Problem: [1 sentence, active voice, ≤25 words]

Why: [1 sentence mechanism, active voice, ≤25 words]

## 2. Blast Radius Assessment

Impact Scope: LOCALIZED

Affected callers: [Function/component calling the broken code, if any]
Affected consumers: [Downstream systems consuming the result]
Shared state at risk: [None | Describe if relevant]

## 3. Evidence

Code:
[5–10 lines showing the bug]

Symptom: $ [command] → [error]
Reproduce: [Minimal steps]

## 4. Confidence

Level: [1–5]
Justification: [Why this level based on rubric below]

---

## Confidence Rubric (All Tiers)

1: Speculative hypothesis (unverified pattern match).
2: Plausible theory supported by error logs or stack trace alone.
3: Static verification (call paths, types, and manifests checked against source).
4: Replicated in code trace or verified against integration contracts.
5: Deterministically verified with reproducible test or trace execution.