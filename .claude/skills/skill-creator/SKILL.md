---
name: skill-creator
description: >
  Author, modify, review, or refine LangGraph Deep Agent skills (SKILL.md). Use
  this skill when creating a new skill or updating existing skill definitions,
  triggers, tool schemas, or state contracts for LangGraph Deep Agents. Do not
  use for generic LangGraph graph wiring, standard Python application code, or
  skills intended for other agent frameworks.
---
# Agent Skill Authoring Rules (Expert Reference)

A single, authoritative rule set distilled from the official Agent Skills docs:
Quickstart, Best Practices, Optimizing Descriptions, and Using Scripts.
Use this as a checklist/lint sheet whenever you author or review a `SKILL.md`.

---

## 0. Mental Model: Progressive Disclosure

Everything below serves one goal: agents only see `name` + `description` at
startup. Only when a task matches does the full `SKILL.md` body load into
context. Structure and write accordingly:

- `name` + `description` = **the trigger** (must be precise, keyword-rich, imperative).
- `SKILL.md` body = **the core procedure** (must be lean — loads on every activation).
- `references/`, `assets/`, `scripts/` = **on-demand detail** (loads only when the body tells the agent to load it).

If you remember nothing else: **cheap to discover, cheap to load, expensive detail deferred.**

---

## 1. File & Folder Structure

```
my-skill/
├── SKILL.md            # required — name, description, core instructions
├── scripts/             # optional — executable, tested, reusable scripts
├── references/          # optional — detail loaded on demand ("read X if Y")
└── assets/               # optional — templates, boilerplate, long examples
```

- `name` must match the folder name.
- One skill = one coherent unit of work (see §3).
- Keep `SKILL.md` under **~500 lines / ~5,000 tokens**. If you're near the
  limit, move detail out to `references/`, not delete it — but only if it's
  genuinely needed on demand.


---

## 2. Writing the `description` Field (Triggering)

The description carries the **entire burden of activation**. Get it wrong and
the skill either never fires or fires on everything.

**Rules:**
1. **Imperative framing.** Write "Use this skill when…", not "This skill does…". The agent is deciding whether to *act*.
2. **User intent, not internals.** Describe what the user is trying to achieve, not how the skill works internally.
3. **Be pushy, not vague.** Explicitly enumerate trigger contexts, including ones where the user won't name the domain directly (e.g., "even if they don't say 'CSV' or 'analysis'").
4. **Concise but complete.** A few sentences to a short paragraph. Hard limit: **1024 characters**.
5. **Precision cuts both ways.** Broaden scope to catch valid-but-indirect asks; add explicit exclusions/boundaries to avoid false-triggering on near-miss tasks that sound similar but need a different skill.
6. Remember: agents typically skip skills for trivial one-step tasks they can already do (e.g. "read this PDF" won't trigger a PDF skill on its own). Your description earns its keep on non-trivial, domain-specific, or unfamiliar-format tasks.

**Before/after pattern:**
```yaml
# Weak
description: Process CSV files.

# Strong
description: >
  Analyze CSV and tabular data files — compute summary statistics, add
  derived columns, generate charts, and clean messy data. Use this skill
  when the user has a CSV, TSV, or Excel file and wants to explore,
  transform, or visualize the data, even if they don't explicitly mention
  "CSV" or "analysis."
```

### 2.1 Validate the description with evals, don't guess

Build an `eval_queries.json` of ~20 realistic prompts (8–10 should-trigger,
8–10 should-not-trigger):

- **Should-trigger** — vary phrasing (formal/casual/typos), explicitness
  (names the domain vs. doesn't), detail level, and task complexity
  (single-step vs. buried in a longer task). The most valuable cases are
  ones where relevance isn't obvious from keywords alone.
- **Should-not-trigger** — prioritize **near-misses**: prompts sharing
  vocabulary/concepts but needing a genuinely different capability (e.g.
  "update formulas in my Excel budget" vs. a CSV-analysis skill). Avoid
  trivially unrelated negatives — they test nothing.
- Use realistic noise: file paths, "my manager asked…", specific names/values, typos.

**Run each query 3× (nondeterminism).** Compute a *trigger rate* per query.
Pass threshold: should-trigger rate > 0.5; should-not-trigger rate < 0.5.

**Avoid overfitting — split train (~60%) / validation (~40%):**
1. Evaluate description on both sets.
2. Diagnose *train-set* failures only:
   - Should-trigger failing → description too narrow → broaden scope/context.
   - Should-not-trigger false-firing → description too broad → add explicit exclusions / sharpen the boundary with adjacent skills.
   - Never hard-code exact failed-query keywords — generalize to the underlying category (that's the difference between fixing and overfitting).
   - If stuck after several passes, try a structurally different description, not another tweak.
3. Repeat (≈5 iterations is typically enough).
4. **Select by validation pass rate**, not by train performance or recency — an earlier draft may generalize better than your latest edit.
5. Sanity-check the final description with 5–10 fresh, never-before-used queries.

---

## 3. Scoping the Skill (What Goes In One Skill)

Think of a skill like a function signature:

- **Too narrow** → forces multiple skills to co-load for one task, risking overhead and conflicting instructions.
- **Too broad** → becomes hard to trigger precisely and hard to keep lean.
- **Right-sized** → one coherent unit that composes cleanly with other skills (e.g. "query a DB and format results" ✅; "…and also administer the DB" ❌ — split it).

Test: could you describe this skill's job in one sentence without an "and
also…"? If not, split it.

---

## 4. Grounding in Real Expertise (Don't Write From Vibes)

Generic LLM-generated skills produce generic advice ("handle errors
appropriately") that adds no value over the agent's own judgment. Ground every
skill in one of two sources:

**A. Extract from a completed hands-on task.** Do the task once with an
agent, providing real corrections/preferences, then extract the reusable
pattern. Capture:
- The sequence of steps that actually worked.
- Every correction you had to make ("use X not Y," "watch out for edge case Z").
- Real input/output shapes.
- Project-specific context the agent didn't already know.

**B. Synthesize from existing project artifacts.** Feed an LLM your team's
actual runbooks, incident reports, API specs/schemas, code review comments,
and version-control patches/fixes — not generic "best practices" articles.
Project-specific schemas and failure modes are what make the output
non-generic.

---

## 5. Content Density — What to Include vs. Cut

Every token in `SKILL.md` competes with conversation history and other
loaded skills for the agent's attention. Budget ruthlessly.

**Include only what the agent wouldn't know on its own:**
- Project/domain conventions, non-obvious edge cases, specific APIs/tools to use, exact commands.
- Don't explain what a PDF is or how HTTP works — the model already knows.

**The litmus test for every paragraph/example:** *"Would the agent get this
wrong without this instruction?"* No → cut it. Unsure → test it (§7). If the
agent already nails the task with no skill at all, the skill isn't earning
its context cost — reconsider whether it should exist.

**Moderate detail beats exhaustive documentation.** Concise, stepwise
guidance + one working example generally **outperforms** an exhaustive
manual — over-specifying causes the agent to chase irrelevant instructions
or get lost extracting what actually applies. When tempted to enumerate every
edge case, ask whether the agent's own judgment already handles most of them.

**Move overflow to `references/` with an explicit load trigger.** Don't just
say "see references/ for details" — say exactly *when* to load it:
> "Read `references/api-errors.md` if the API returns a non-200 status code."
This preserves progressive disclosure instead of defeating it.

---

## 6. Calibrating Prescriptiveness

Not every instruction deserves the same rigidity. Match specificity to how
much the task can tolerate variation.

| Situation | Style | Why |
|---|---|---|
| Multiple valid approaches, task tolerant of variation | Loose, explain **why** | Understanding intent lets the agent make good context-dependent calls |
| Fragile operation, must follow exact sequence, consistency critical | Prescriptive, exact commands, "do not modify" | Deviation breaks things |

Example of loose (freedom + rationale):
```markdown
## Code review process
1. Check all database queries for SQL injection (use parameterized queries)
2. Verify authentication checks on every endpoint
3. Look for race conditions in concurrent code paths
```

Example of strict (fragile op, exact sequence):
```markdown
## Database migration
Run exactly this sequence:
    python scripts/migrate.py --verify --backup
Do not modify the command or add additional flags.
```

Most real skills mix both — calibrate section by section, not globally.

**Provide defaults, not menus.** Don't list every tool that "could" work
(pypdf, pdfplumber, PyMuPDF, pdf2image...) — pick a default and name the
one legitimate alternative/escape hatch briefly.

**Favor procedures over declarations.** Teach *how to approach a class of
problems*, not the answer to one specific instance:
```markdown
<!-- Bad: only useful once -->
Join `orders` to `customers` on `customer_id`, filter region='EMEA'...

<!-- Good: generalizes -->
1. Read the schema from references/schema.yaml to find relevant tables
2. Join tables using the _id foreign key convention
3. Apply requested filters as WHERE clauses
4. Aggregate and format as a markdown table
```
(Concrete output templates, hard constraints like "never output PII," and
tool-specific commands are still fine — it's the *approach* that must
generalize, not every detail.)

---

## 7. Proven Structural Patterns (Use What Fits)

Not all skills need all of these — pick per task.

### 7.1 Gotchas section (highest-value content in most skills)
Concrete, environment-specific facts that defy reasonable assumptions —
not generic advice:
```markdown
## Gotchas
- The `users` table uses soft deletes. Queries must include
  `WHERE deleted_at IS NULL` or results include deactivated accounts.
- `user_id` (DB) = `uid` (auth service) = `accountId` (billing API) — same value.
- `/health` returns 200 even if the DB connection is down. Use `/ready` instead.
```
Keep gotchas **inline in `SKILL.md`**, not in an on-demand reference file —
the agent won't know to fetch a gotcha it doesn't yet know exists. Every time
you have to correct an agent's mistake in practice, that correction becomes a
new gotcha entry — this is the single fastest skill-improvement loop.

### 7.2 Templates for output format
Concrete templates beat prose descriptions of format — agents pattern-match
structure better than they parse specs. Inline for short templates; put long
or conditionally-needed templates in `assets/` and reference them.

### 7.3 Checklists for multi-step workflows
Explicit `- [ ]` checklists prevent step-skipping when steps have
dependencies or gates.

### 7.4 Validation loops
Do work → run a validator (script/checklist/self-check) → fix → repeat until
it passes → only then proceed. A reference doc can itself serve as the
"validator" if the agent is told to check its work against it.

### 7.5 Plan → Validate → Execute (for batch/destructive ops)
Have the agent (1) produce a structured intermediate plan, (2) validate the
plan against ground truth with a script that gives specific, actionable
errors ("Field 'x' not found — available fields: a, b, c"), (3) only then
execute. The validation script is the load-bearing part — invest there.

### 7.6 Bundle reusable scripts
If execution traces show the agent reinventing the same logic every run
(chart builder, parser, validator) — stop describing it in prose and write
+ bundle a tested script in `scripts/` instead (see §9).

---

## 8. Frontmatter & Format Essentials (from Quickstart/Spec)

```yaml
---
name: roll-dice
description: >
  Roll dice using a random number generator. Use when asked to roll a die
  (d6, d20, etc.), roll dice, or generate a random dice roll.
---
```
- `name`: short identifier, must equal the folder name.
- `description`: see §2 — the entire triggering mechanism.
- Body: the instructions loaded on activation. Can be as short as a few
  lines if the task is simple — don't pad for padding's sake.
- Skills are an **open format** — portable across compliant agent clients
  (VS Code/Copilot, Claude Code, OpenAI Codex, etc.).

---

## 9. Scripts: Designing for Agentic (Non-Interactive) Execution

### 9.1 One-off commands vs. bundled scripts
- Use a direct one-off command (`uvx`, `pipx run`, `npx`, `bunx`, `deno run`,
  `go run`) when an existing package already does the job and the invocation
  is a few flags.
- **Pin exact versions** (`npx eslint@9.0.0`) for reproducibility.
- State runtime prerequisites explicitly in `SKILL.md` (e.g. "Requires
  Node.js 18+") or via the `compatibility` frontmatter field — never assume.
- Once a command grows complex/fragile enough that getting it right the
  first time is unreliable, promote it to a tested script in `scripts/`.

### 9.2 Self-contained scripts
Prefer inline dependency declarations so a script runs with one command and
no separate install step:
- Python: PEP 723 inline metadata block + `uv run script.py` (or `pipx run`).
- Deno: `npm:`/`jsr:` specifiers, no manifest needed.
- Bun: auto-installs at runtime if no `node_modules` present; pin versions in the import.
- Ruby: `bundler/inline` with `gemfile do ... end`.

### 9.3 Referencing scripts from `SKILL.md`
- Use **relative paths from the skill directory root** — never absolute paths.
- List available scripts explicitly so the agent knows they exist:
  ```markdown
  ## Available scripts
  - `scripts/validate.sh` — Validates configuration files
  - `scripts/process.py` — Processes input data
  ```
- Same relative-path convention applies inside `references/*.md`.

### 9.4 Hard requirements for any script an agent will run
- **No interactive prompts, ever.** Agents run in non-interactive shells and
  cannot answer TTY prompts/password dialogs — a blocking prompt hangs
  forever. Accept everything via flags, env vars, or stdin. On missing
  required input, fail fast with a clear, actionable error — don't block.
- **`--help` is the interface contract.** It's how the agent learns your
  script — include description, flags, and usage examples, but keep it
  concise (it enters the agent's context).
- **Errors must be actionable**, not opaque: state what was wrong, what was
  expected, and how to fix it (e.g. `Error: --format must be one of: json,
  csv, table. Received: "xml"`), not "Error: invalid input."
- **Structured output** (JSON/CSV/TSV) over whitespace-aligned text — both
  the agent and pipeline tools (`jq`, `awk`) can consume it reliably.
- **Separate data from diagnostics**: structured results → stdout; progress/
  warnings/logs → stderr.
- **Idempotency** — agents may retry; "create if not exists" beats "create,
  fail if exists."
- **Closed input sets** — reject ambiguous input with a clear error instead
  of silently guessing.
- **`--dry-run`** for anything destructive/stateful.
- **Distinct, documented exit codes** per failure type (not-found vs.
  invalid-args vs. auth-failure), explained in `--help`.
- **Safe defaults for destructive ops** — require `--confirm`/`--force` where risk warrants it.
- **Bound output size.** Harnesses often truncate tool output past ~10–30K
  chars. Default to summaries; support `--offset`/pagination; for
  unavoidably large, non-paginated output, require an explicit `--output
  <file>|-` flag so large stdout dumps are opt-in, not accidental.

---

## 10. Evaluating & Iterating on Output Quality

Triggering correctly (§2) is necessary but not sufficient — the skill also
has to produce good output. Treat this as its own eval loop.

### 10.1 Test case design (`evals/evals.json`)
Each test case = `prompt` + `expected_output` (+ optional `files`).
- Start with just **2–3 cases** before investing further.
- Vary phrasing/formality/detail level.
- Include at least one deliberate edge case (malformed input, ambiguous request, boundary condition).
- Use realistic context (file paths, names, real-sounding data) — "process this data" tests nothing.
- Don't pre-define pass/fail assertions yet — write those after seeing first outputs.

### 10.2 Run with-skill vs. without-skill (or vs. previous version)
Always compare against a baseline. Structure:
```
<skill>-workspace/iteration-N/eval-<case>/{with_skill,without_skill}/{outputs/,timing.json,grading.json}
```
Each run starts from a **clean context** (fresh subagent/session) so results
reflect only what `SKILL.md` provides. Capture `total_tokens` and
`duration_ms` per run — quality gains that triple token cost are a different
trade-off than gains that are free.

### 10.3 Assertions — the grading unit
Good assertions are **objective and checkable**:
- ✅ "Output file is valid JSON" / "Chart has labeled axes" / "Report includes ≥3 recommendations."
- ❌ "Output is good" (too vague) / requiring exact wording (too brittle).
Use verification **scripts** for mechanical checks (valid JSON, row counts,
file existence/dimensions) — more reliable and reusable than LLM judgment.
Reserve subjective qualities (style, "feels right") for human review, not assertions.

Grading requires **concrete evidence**, not benefit of the doubt — a section
titled "Summary" containing one vague sentence is a FAIL against "includes a
summary," because the label exists but the substance doesn't.

For holistic comparison between two versions, use **blind LLM-judge
comparison** (outputs shown without revealing which version produced which)
to score organization/formatting/polish free of "should be better" bias.

### 10.4 Aggregate and analyze
Compute mean/stddev of pass_rate, time, tokens for with/without-skill, and
the **delta** between them. Then look past the aggregate:
- Assertions that pass in **both** configs → not useful, remove (model already handles it).
- Assertions that **always fail in both** → broken assertion or too-hard test case — fix, don't blame the skill.
- Assertions passing **with** but failing **without** → this is where the skill demonstrably earns its keep.
- High variance across identical runs → ambiguous instructions; add examples/specificity.
- Time/token outliers → read the actual execution transcript to find the bottleneck.

### 10.5 The iteration loop
1. Feed an LLM: failed assertions + human feedback + execution transcripts + current `SKILL.md`.
2. Ask it to propose changes that **generalize** (not narrow patches for the exact failing prompt).
3. Apply, then re-run the full eval set in a new `iteration-N+1/`.
4. Grade, aggregate, human-review again.
5. Stop when feedback is consistently empty or improvement plateaus.

Guiding principles for every proposed change:
- **Generalize**, don't overfit to specific failing examples.
- **Keep it lean** — if pass rates plateau despite adding rules, try *removing* instructions; over-constraining hurts as much as under-specifying.
- **Explain the why**, not just the rule — "do X because Y causes Z" outperforms "ALWAYS X, NEVER Y" for reliability.
- **Bundle repeated logic** into `scripts/` the moment you see it reinvented across ≥2 runs.

---

## 11. End-to-End Authoring Checklist

Before shipping a skill, confirm every box:

- [ ] Skill covers one coherent unit of work (not two skills glued together, not a sliver of one)
- [ ] Grounded in a real completed task or real project artifacts — not generic training-data advice
- [ ] `name` matches folder name
- [ ] `description` is imperative, intent-focused, explicit about indirect triggers, under 1024 chars
- [ ] Description validated against ~20 should/should-not-trigger eval queries, with train/validation split, 3 runs each
- [ ] `SKILL.md` body under ~500 lines / 5K tokens; overflow moved to `references/` with explicit "load when X" triggers
- [ ] Every paragraph passes the "would the agent get this wrong without it?" test
- [ ] Prescriptiveness calibrated per-section (loose+why vs. strict+exact) to match task fragility
- [ ] Defaults given instead of tool menus; alternatives noted briefly
- [ ] Procedures generalize beyond the example used to write them
- [ ] Gotchas section present and inline (not deferred to a reference file)
- [ ] Output templates/checklists/validation loops used where the task calls for them
- [ ] Any bundled `scripts/` are non-interactive, have `--help`, give actionable errors, emit structured stdout + diagnostic stderr, are idempotent, bound their output size, and use relative paths
- [ ] At least 2–3 eval test cases with expected outputs exist in `evals/evals.json`
- [ ] Skill benchmarked with-skill vs. without-skill; assertions show real, non-trivial lift
- [ ] At least one execute → gather feedback → revise cycle completed before calling it done

---

### Source docs synthesized
- Quickstart — https://agentskills.io/skill-creation/quickstart
- Best practices — https://agentskills.io/skill-creation/best-practices
- Optimizing descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
- Evaluating skill output quality — https://agentskills.io/skill-creation/evaluating-skills
- Using scripts in skills — https://agentskills.io/skill-creation/using-scripts
