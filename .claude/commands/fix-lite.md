---
description: Trivial fix - one-liner, zero blast radius
---

Target: $ARGUMENTS

## Root Cause & Strategy

[1 sentence: what's wrong, how to fix]

## Code Change

```diff
[Minimal diff, ≤5 lines]
```

## Backward Compatibility

✓ No API/schema changes
✓ No behavior changes
✓ No breaking changes

## Verification

```bash
$ [command to test fix]
```

✓ All tests pass

## Confidence

Level: 3–5 (Static verification)
Why: Fix is obvious; single line changed; no side effects possible.

## Self-Audit

✓ Smallest diff? Yes
✓ Zero bloat? Yes
✓ Tests pass? Yes
✓ Safe to deploy? Yes (immediate)