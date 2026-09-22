---
description: Apply surgical bugfix with verification and confidence scoring
---
Target: Diagnose root cause and apply a minimal surgical fix for: $ARGUMENTS

Workflow:
1. Trace the exact failure mechanism before modifying code.
2. Produce the smallest possible diff (no refactoring, no unneeded helpers).
3. Run or write characterization tests to prove zero regression.
4. Output a Confidence Rubric rating (1-5):
   - 1: Speculative guess
   - 3: Type/schema verified
   - 5: Reproduced with deterministic test/trace confirmation
5. Auto-evaluate against /ponytail and /ponytail-review before finalizing.