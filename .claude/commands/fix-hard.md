---
description: Complex fix - multi-module, state/concurrency involved
---

Target: $ARGUMENTS

## 1. Root Cause & Strategy

[2 sentences: broken invariant, mechanism, surgical fix]

## 2. Code Change

```diff
[Diff: 20–50 lines, focused]
```

## 3. Blast Radius Assessment

Impact scope: [LOCALIZED | MODULE-LEVEL | SYSTEM-WIDE]

Callers affected:
  - [Caller A]: [How it's affected] → [Test to verify]
  - [Caller B]: [How it's affected] → [Test to verify]

Consumers affected:
  - [Consumer A]: [How it's affected] → [Test to verify]

Shared state: [Cache | Database | Message queue | None]

## 4. Failure Modes (if ≥2)

Mode A: [Condition]
  Outcome: [Observable symptom]
  Tested: $ [command]

Mode B: [Condition]
  Outcome: [Observable symptom]
  Tested: $ [command]

## 5. Backward Compatibility

Migration path:
  □ Existing callers still work? $ [test]
  □ Error behavior unchanged? $ [test]
  □ Cache/state invalidation handled? $ [test]

## 6. Semantic Contract

Invariants to preserve:
  □ [Invariant A] holds? $ [assertion test]
  □ [Invariant B] holds? $ [assertion test]
  □ [Invariant C] holds? $ [assertion test]

## 7. Performance Impact

Before: $ [benchmark] → [p50/p99/throughput]
After: $ [benchmark] → [p50/p99/throughput]

Regression: [±X%] → [PASS/FAIL within bounds]

## 8. Side-Effect Audit

Functions modified: [List]
Downstream dependents: [Caller 1, Caller 2, Caller 3] → Tested
Cache/state changes: [Which caches? Invalidated?] → Verified

## 9. Edge Case Coverage

```bash
$ npm test -- --coverage test/[module].test.js
```

Coverage: [Lines X%, Branches X%, Edge cases Y/Z]

Tested edge cases:
  □ Concurrent access: $ [test]
  □ Empty state: $ [test]
  □ Boundary values: $ [test]
  □ Error paths: $ [test]

## 10. Regression Testing

```bash
$ npm test -- test/[module].test.js
```

Results:
  ✓ All existing tests pass
  ✓ No new failures
  ✓ New test cases added: [N] edge cases
  ✓ Coverage: [X]%

## 11. Deployment Risk

Risk level: YELLOW (Medium)

Deployment approach:
  → Canary to 10%, then 50%, then 100%
  → Monitor [metrics] for [X minutes] at each stage
  → Rollback if: Error rate > 2% or Latency p99 > 1.5x baseline

Monitoring:
  - Alert: Error rate > 2% → Escalate
  - Alert: Latency p99 > 1.5x → Investigate
  - Check: All callers return expected results

## 12. Confidence

Level: 3–4
Why: [Code paths traced | Reproduced under load | All failure modes tested]

## Self-Audit

✓ Smallest diff? Yes
✓ Backward compatible? Yes (with verification)
✓ Contract preserved? Yes (invariants tested)
✓ Tests pass? Yes
✓ Performance acceptable? Yes
✓ Side effects audited? Yes
✓ Safe to deploy? Yes (with canary)