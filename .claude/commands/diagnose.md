---
description: RCA - Complex Bug
---

Target: $ARGUMENTS

## 1. Root Cause Identification

Location: [file:line] in [function]()

Broken Contract: [What invariant/assumption is violated?]

Problem: [1 sentence, active voice, ≤25 words]

Why: [1–2 sentences mechanism, ≤25 words each]

## 2. Blast Radius Assessment

Impact Scope: [LOCALIZED | MODULE-LEVEL | SYSTEM-WIDE]

Upstream callers: [All code paths calling the broken function]
Downstream consumers: [All code using the broken output or state]
Shared state affected: [Cache | Database | Message queue | Etc.]
Sibling impacts: [Do related functions have the same issue?]

## 3. Failure Modes [If ≥2 distinct symptoms]

Mode A: [Trigger condition]
  Outcome: [Observable symptom]
  Boundary: [When does this occur?]

Mode B: [Trigger condition]
  Outcome: [Observable symptom]
  Boundary: [When does this occur?]

## 4. Reproduction & Confirmation

Minimal trigger:
$ [Command that deterministically triggers failure]

Expected output (broken):
[Error message or wrong result]

Verification approach:
[How to confirm the diagnosis is correct]

## 5. Proposed Repair Strategy

Repair location: [File(s) and function(s) to modify]

Repair abstraction: [Function-level | Module interface | State schema | API contract]

Conceptual fix: [What changes, no code diffs]

Why it works: [How this restores the broken contract]

Side effects: [What else changes? Backward compatibility?]

## 6. Confidence

Level: [1–5]

Justification: [Why this level based on rubric]

Next steps (if <5): [What additional verification is needed]