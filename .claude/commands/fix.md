---
description: Simple fix - localized, single module
---

Target: $ARGUMENTS

## 1. Root Cause & Strategy

[1–2 sentences: broken invariant, fix approach]

## 2. Code Change

```diff
[Diff: 5–20 lines max]
```

## 3. Backward Compatibility

✓ Certification:
  □ No API signature changes
  □ No error behavior changes
  □ No return type changes
  □ Works with existing callers

## 4. Semantic Contract

Invariant: [What must be true?]

Before fix: [Broken example]
After fix: [Restored example]

Edge cases handled:
  □ Null input: ✓ (returns X)
  □ Empty collection: ✓ (returns X)
  □ Boundary value: ✓ (returns X)

## 5. Regression Testing

```bash
$ npm test -- test/[module].test.js
```

Results:
  ✓ All existing tests pass
  ✓ No new failures
  ✓ Coverage: [X]%

## 6. Confidence

Level: 3–4
Why: [Code review confirms fix | Reproduced and verified]

## Self-Audit

✓ Smallest diff? Yes
✓ Backward compatible? Yes
✓ Contract restored? Yes
✓ Tests pass? Yes
✓ Safe to deploy? Yes (low-risk, monitored)