---
description: Implement feature - minimal diff, ponytail-optimized
---

Target: $ARGUMENTS

## 0. Pre-flight - Ponytail Check

```bash
/ponytail full
```

Ruleset: [Active rules from ponytail compressed CLAUDE.md]
Scope: [LOCALIZED | MODULE-LEVEL | SYSTEM-WIDE]

Requirement: [1 sentence: what to build, ≤25 words]

## 1. Requirement & Strategy

Requirement: [1 sentence: active voice, ASD-STE100]

Strategy: [1-2 sentences: approach + where to change, ≤25 words each]

Abstraction: [Function-level | Module interface | State schema | API contract]
Blast radius: [Single file | Module | Cross-module]

## 2. Code Change

```diff
[Diff: 5-20 lines max, no refactoring, no unneeded helpers]
```

Files touched: [file:line]
Dependencies: [None | List]
Token cost: [Ponytail compressed - no CLAUDE.md re-read]

## 3. Backward Compatibility

✓ Certification:
  □ No API signature changes
  □ No error behavior changes
  □ No return type changes
  □ Works with existing callers
  □ Feature flagged if risky
  □ No new runtime deps

## 4. Semantic Contract

Invariant: [What must be true after implementation?]

Before: [State without feature - example]
After: [State with feature - example]

Edge cases handled:
  □ Null input: ✓ (returns X)
  □ Empty collection: ✓ (returns X)
  □ Boundary value: ✓ (returns X)
  □ Error path: ✓ (throws/returns Y)

## 5. Verification

```bash
$ npm test -- test/[module].test.js
$ npm run build
$ rtk gain
```

Results:
  ✓ All existing tests pass
  ✓ New feature tests: cases
  ✓ No regressions
  ✓ Coverage: %
  ✓ Build succeeds
  ✓ RTK saved: [X tokens / Y%][X][N]

## 6. Ponytail Review

```bash
/ponytail review
```

Review Output:
```
[Paste complete ponytail-review output here]
```

Compliance:
  □ No rule violations from compressed CLAUDE.md
  □ No global instruction ignored
  □ No redundant file reads
  □ Context usage: k / k[X][Budget]

## 7. Confidence

Level: 3-4
Why: [Contract verified via types/schema | Tests prove behavior]

Next steps (if <3): [What verification needed]

## Self-Audit

✓ Ponytail active? Yes (/ponytail full ran)
✓ Smallest diff? Yes
✓ Zero bloat? Yes
✓ Backward compatible? Yes
✓ Contract fulfilled? Yes
✓ Tests pass? Yes
✓ Ponytail review passed? Yes
✓ Safe to deploy? Yes (low-risk, monitored)
✓ Docs updated? Yes/No