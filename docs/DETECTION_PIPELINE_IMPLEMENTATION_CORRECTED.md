# Detection Pipeline Implementation Guide — CORRECTED

## Executive Summary

CCVIE's detection system will use **Poisson scan statistics as the primary mechanism** (explainable, measurable, ground-truth-based) and **BERTopic as a supplemental weekly job** (exploratory, low-cost, human-reviewed).

This design answers the evaluator question "What if an emerging issue doesn't fit your taxonomy?" while preserving explainability and auditability where it matters most (routing and eval gate).

---

## Critical Fixes Before Coding

### FIX 1: SQL and asyncpg Placeholders ✅

**WRONG (from original):**
\\\python
await db.fetch("""
    SELECT lq.id as queue_id, v.id as verbatim_id, v.text, lq.taxonomy_coverage
    FROM low_coverage_queue lq
    JOIN verbatims v ON lq.verbatim_id = v.id
    WHERE r.taxonomy_coverage < \  -- Wrong table alias
""", threshold)

await db.executemany("""
    INSERT INTO low_coverage_queue 
    (verbatim_id, taxonomy_coverage, flagged_at)
    VALUES (\, \, NOW())
""", [(r['id'], r['taxonomy_coverage']) for r in low_coverage])  -- executemany is wrong
\\\

**CORRECT:**
\\\python
async def nightly_low_coverage_flagging_job():
    \"""Flag verbatims with taxonomy_coverage < threshold.\"""
    threshold = settings.LOW_COVERAGE_QUEUE_THRESHOLD  # 0.3
    
    # Find recent verbatims with low coverage
    # Using asyncpg query with proper placeholders
    low_coverage = await db.fetch("""
        SELECT v.id, r.taxonomy_coverage
        FROM verbatims v
        JOIN routing_results r ON v.id = r.verbatim_id
        WHERE r.taxonomy_coverage < \
          AND r.created_at > NOW() - INTERVAL '1 day'
          AND NOT EXISTS (
            SELECT 1 FROM low_coverage_queue lq 
            WHERE lq.verbatim_id = v.id AND lq.processed = FALSE
          )
    """, threshold)
    
    # Use execute in a loop, NOT executemany (asyncpg doesn't have executemany for INSERTs)
    for record in low_coverage:
        await db.execute("""
            INSERT INTO low_coverage_queue 
            (verbatim_id, taxonomy_coverage, flagged_at)
            VALUES (\, \, NOW())
            ON CONFLICT (verbatim_id) WHERE processed = FALSE DO NOTHING
        """, record['id'], record['taxonomy_coverage'])
\\\

**Key fixes:**
- \, \ placeholders (asyncpg style, NOT Python % formatting)
- Loop through results + execute individually (asyncpg has no executemany for INSERT)
- ON CONFLICT DO NOTHING for idempotency (handles race condition)
- Correct table alias (.taxonomy_coverage not wrong alias)

---

### FIX 2: Explicit Dependency Versions ✅

**WRONG (from original):**
\\\	oml
dependencies = [
    "bertopic>=0.14",
    "sentence-transformers>=2.0",
]
\\\

**CORRECT:**
\\\	oml
dependencies = [
    "fastapi>=0.115",
    "pydantic-settings>=2.6",
    "uvicorn>=0.32",
    
    # BERTopic ecosystem — all pinned for reproducibility
    "bertopic==0.16.0",
    "umap-learn==0.5.5",
    "hdbscan==0.8.33",
    "sentence-transformers==2.7.0",
    "torch==2.1.2",
    "numpy==1.24.3",
]
\\\

**Why pinned:**
- BERTopic uses UMAP + HDBSCAN internally; version changes = different clusters
- Even with andom_state=42, UMAP/HDBSCAN cluster differently across versions
- SentenceTransformer embedding model output changes with versions
- For reproducibility, all must be locked

---

### FIX 3: Reproducibility Seeds (GPU Determinism) ✅

**WRONG (from original):**
\\\python
model = BERTopic(
    embedding_model=settings.BERTOPIC_EMBEDDING_MODEL,
    nr_topics="auto",
    seed=settings.BERTOPIC_RANDOM_STATE,
    verbose=True
)
topics, probs = model.fit_transform(texts)
\\\

**CORRECT:**
\\\python
import os
import torch
import numpy as np
from sentence_transformers import SentenceTransformer

async def weekly_bertopic_job():
    # Set seeds for reproducibility across torch, numpy, random
    os.environ['PYTHONHASHSEED'] = str(settings.BERTOPIC_RANDOM_STATE)
    np.random.seed(settings.BERTOPIC_RANDOM_STATE)
    torch.manual_seed(settings.BERTOPIC_RANDOM_STATE)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(settings.BERTOPIC_RANDOM_STATE)
    
    # Log versions for audit trail
    import bertopic
    from sentence_transformers import __version__ as st_version
    
    logger.info(f"BERTopic version: {bertopic.__version__}")
    logger.info(f"SentenceTransformer version: {st_version}")
    logger.info(f"Random seed: {settings.BERTOPIC_RANDOM_STATE}")
    
    # Fetch verbatims (same as before)
    # ...
    
    # Run BERTopic with fixed seed
    model = BERTopic(
        embedding_model=settings.BERTOPIC_EMBEDDING_MODEL,
        nr_topics="auto",
        seed=settings.BERTOPIC_RANDOM_STATE,
        verbose=True,
        language="english"
    )
    
    topics, probs = model.fit_transform(texts)
    
    # ... process results ...
    
    # Store version info in notes for auditability
    version_notes = f"BERTopic {bertopic.__version__}, ST {st_version}, seed {settings.BERTOPIC_RANDOM_STATE}"
    
    for _, topic_row in topic_info.iterrows():
        # ...
        await db.execute("""
            INSERT INTO taxonomy_proposals
            (..., notes)
            VALUES (..., \)
        """, ..., version_notes)
\\\

---

### FIX 4: Prevent Queue Duplicates (Unique Constraint) ✅

**Database migration:**
\\\sql
-- Prevent same verbatim from appearing multiple times in unprocessed queue
CREATE UNIQUE INDEX ux_low_coverage_verbatim_unprocessed 
  ON low_coverage_queue(verbatim_id) 
  WHERE processed = FALSE;

-- Index for efficiency
CREATE INDEX idx_low_coverage_unprocessed 
  ON low_coverage_queue(processed, flagged_at);

CREATE INDEX idx_taxonomy_proposals_status 
  ON taxonomy_proposals(status, created_at);
\\\

**Why:** Without this, nightly job could insert the same verbatim twice if it appears in both yesterday's and today's low-coverage set.

**Updated ingestion code:**
\\\python
async def nightly_low_coverage_flagging_job():
    threshold = settings.LOW_COVERAGE_QUEUE_THRESHOLD  # 0.3
    
    low_coverage = await db.fetch("""
        SELECT v.id, r.taxonomy_coverage
        FROM verbatims v
        JOIN routing_results r ON v.id = r.verbatim_id
        WHERE r.taxonomy_coverage < \
          AND r.created_at > NOW() - INTERVAL '1 day'
    """, threshold)
    
    # This now handles duplicates via unique index constraint
    for record in low_coverage:
        try:
            await db.execute("""
                INSERT INTO low_coverage_queue 
                (verbatim_id, taxonomy_coverage, flagged_at)
                VALUES (\, \, NOW())
                ON CONFLICT (verbatim_id) WHERE processed = FALSE DO NOTHING
            """, record['id'], record['taxonomy_coverage'])
        except Exception as e:
            logger.warning(f"Could not insert {record['id']}: {e}")
    
    queue_size = await db.fetchval(
        "SELECT COUNT(*) FROM low_coverage_queue WHERE processed = FALSE"
    )
    logger.info(f"Low-coverage queue size: {queue_size}")
\\\

---

### FIX 5: Threshold for 2-Week Capstone ✅

**WRONG (from original):**
\\\python
BERTOPIC_RUN_THRESHOLD: int = 500  # Too high for capstone
\\\

**Math:**
- ~50 verbatims/day with low coverage
- 50 × 7 = 350/week
- Threshold of 500 means: never runs Week 1, might skip early Week 2
- For a 2-week demo, you need BERTopic to run at least once

**CORRECT:**
\\\python
# For capstone (2 weeks): lower threshold to ensure runs
BERTOPIC_RUN_THRESHOLD: int = 300  # Runs by midway through Week 2
# ALTERNATIVE: Run daily instead of weekly (better for short timeline)
BERTOPIC_RUN_SCHEDULE: str = "daily"  # or "weekly" for production
\\\

**Or, make it daily:**
\\\python
async def daily_bertopic_job():  # Run daily for capstone
    \"""Run BERTopic every day on low-coverage queue.\"""
    
    queue_size = await db.fetchval(
        "SELECT COUNT(*) FROM low_coverage_queue WHERE processed = FALSE"
    )
    
    min_threshold = settings.BERTOPIC_RUN_THRESHOLD  # 50 for daily
    
    if queue_size < min_threshold:
        logger.info(f"Queue size {queue_size}, skipping (threshold: {min_threshold})")
        return
    
    # ... run BERTopic ...
\\\

**Updated config:**
\\\python
# --- BERTopic Enrichment (Layer 1, non-blocking) ---
LOW_COVERAGE_QUEUE_THRESHOLD: float = 0.3
BERTOPIC_RUN_THRESHOLD: int = 50  # Daily: run if queue > 50
BERTOPIC_RUN_SCHEDULE: str = "daily"  # "daily" for capstone, "weekly" for production
BERTOPIC_MAX_QUEUE_SIZE: int = 2000  # Max verbatims per run (was 5000)
BERTOPIC_EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
BERTOPIC_RANDOM_STATE: int = 42
\\\

---

## Corrected Timeline

**Week 1 (Days 1-2):**
- ✅ Create database schema (tables + indexes, including unique constraint)
- ✅ Implement nightly low-coverage flagging in ingestion.py (with ON CONFLICT)
- ✅ Add config settings (corrected thresholds)
- ✅ Pin all dependencies in pyproject.toml

**Week 1 (Days 3-5):**
- ✅ Implement ertopic_enrichment.py (with torch/np seeds, version logging)
- ✅ Test daily BERTopic run manually
- ✅ Verify SQL placeholders + asyncpg code
- ✅ Verify no duplicate queue entries

**Week 2 (Days 8-10):**
- ✅ Integrate with eval layer (report BERTopic stats separately)
- ✅ First daily BERTopic run should produce results
- ✅ Human review workflow

**Week 2 (Days 11-14):**
- ✅ Demo: "Here are emerging topics BERTopic found"
- ✅ Show taxonomy_proposals table with human reviews
- ✅ Eval gate still passing (Poisson metrics clean)

---

## Success Criteria (Updated)

✅ Nightly job flags low-coverage verbatims without duplicates (unique constraint prevents dups)

✅ Daily BERTopic runs consistently by Day 5-6 (threshold=50 ensures this)

✅ All dependency versions pinned; same results on different machines

✅ Version info logged in taxonomy_proposals.notes for audit trail

✅ asyncpg SQL code passes without placeholder errors

✅ Eval gate still passes (Poisson metrics unaffected by BERTopic)

✅ Evaluators see: "BERTopic found N topics, human reviewed M, added K to taxonomy"

---

## Final Verdict

**Original plan:** Architecturally correct. Poisson + BERTopic split is right.

**Code issues:** 5 critical fixes needed:
1. ✅ SQL placeholders (asyncpg \, \, ON CONFLICT)
2. ✅ Pinned dependencies (bertopic==0.16.0, umap==0.5.5, hdbscan==0.8.33)
3. ✅ Reproducibility seeds (torch.manual_seed, np.random.seed, version logging)
4. ✅ Unique index (prevent duplicate queue entries)
5. ✅ Threshold (300 or daily for 2-week capstone)

**Ship criteria:** Fix these 5 items, then code is ready. No architectural changes needed.

