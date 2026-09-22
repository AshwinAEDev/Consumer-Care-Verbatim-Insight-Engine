---
description: Diagnose and patch LangGraph Deep Agent skills using ASD-STE100
---
Target: Resolve issue in target LangGraph Agent skill: $ARGUMENTS

Workflow:
1. Root Cause: Trace failure to state mutation, schema mismatch, prompt ambiguity, or routing logic.
2. Targeted Minimal Fix:
   - Smallest possible diff adhering to skill authoring best practices.
   - Strictly follow /ponytail: eliminate speculative instructions and redundant tool schemas.
   - Write/edit skill text strictly adhering to ASD-STE100 (active voice, <=20 words/instruction, zero semicolons).
3. Contract Verification: Verify graph state reducers, sub-agent handoffs, and downstream tool contracts.
4. Output Confidence Rubric (1-5).
5. Self-evaluate against /ponytail-review before generating final output.