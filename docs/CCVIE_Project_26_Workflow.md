# Project 26: CCVIE - Consumer Complaints & Verbatims Intelligence Engine

Complete Business + Technical Workflow

---

## 1. Business Problem

**Context:** CPG company receives **20k+ consumer complaints per month**:
- "resealable bag won't close in Seattle"
- "stale product"

**Current State:** Analysts read Excel sheets and make monthly PPTs. 
- **Lead time = 30 days**
- By then product is already in market, recall cost is high.

**Goal of CCVIE:** Detect a new pack / region / issue cluster in **3-5 days**, not 30 days, with **45 verbatim citations** to prove it.

---

## 2. Business Workflow - What User Sees

1.  **Consumer** calls care center -> complaint text + product + pack + region stored
2.  **System** hourly ingests verbatims, links to taxonomy, detects spike: 
    > "45 complaints - New resealable lid + Pacific Northwest + Seal Failure"
3.  **Insight Engine** generates:
    > "Emerging issue: Seal failure for new lid in PNW, 5x baseline, first seen 3 days ago" + drill-down to 45 verbatims
4.  **Quality Manager** opens Streamlit Tab 1, sees insight card, clicks to see verbatims, takes action - stop shipment
5.  **Success is measured:** Lead time vs monthly report, citation accuracy, routing correctness, cost per query

---

## 3. Technical Workflow - 5 Layers

> Source: Architecture Proposal

### Layer 1: Data Foundation [Player 1]
**Postgres + pgvector is the ONLY DB**

**Tables:**
- `taxonomy`: products, packs, regions, issue_types (from `seed.sql`)
- `graph_nodes(id, label, props jsonb)` + `graph_edges(type, src, dst, props)` = Property Graph with Issue nodes [blueprint requirement met without Neo4j]
- `verbatims(id, text)` + `verbatim_embeddings(node_id, embedding vector(768))`

**Jobs:**
- `ingestion.py` - hourly batch
- `embeddings.py` - sentence-transformers `all-MiniLM-L6-v2`
- HDBSCAN for clustering

**Tools:** PostgreSQL 15, pgvector extension, asyncpg, sentence-transformers, HDBSCAN, volume-corrected Poisson scan [blueprint page 63]

### Layer 2: Router [Player 2]
**LangGraph + Pydantic**

- **Input:** `QueryRequest` contract
- **Features:** `entity_count`, `taxonomy_coverage`, `has_agg_word`, `has_semantic_word`
- **Decision Logic:**
  - **Route A - GRAPH -> GraphRAG:** "Show seal failures for new lid in PNW" - `entity_count=3` -> graph traversal via SQL JOINs
  - **Route B - VECTOR -> 2 sub-routes:**
    - **B1 SQL Aggregate:** "Count complaints" -> `SELECT COUNT(*) GROUP BY`
    - **B2 Semantic:** "What's trending?" -> `ORDER BY embedding <=> query_embedding`
  - **Route C - HYBRID:** "Is PNW issue related elsewhere?" -> Graph + Vector
- **Output:** `RouteDecision` contract
- **Tools:** LangGraph, Pydantic contracts in `backend/src/ccvie/contracts/`, `rules.py` thresholds from `config.py`

### Layer 3: Retrieval + Generation [Player 2]

- **Retrieval:** `graph_queries.py` [GraphRAG] + `vector_queries.py` [pgvector] - both asyncpg direct, read-only `ccvie_reader` role, NOT MCP for detection pipeline
- **Generation:** `llm.py` thin client, model name only from `config.py`, prompt in `synthesize_insight.md` -> generates `InsightResponse` with 45 `SourceRef`
- **Tools:** FastAPI, asyncpg, OpenAI/Mistral client

### Layer 4: Attribution UI [Player 4]
**Next.js + shadcn**

- **Tab 1: Insight feed** - `insight-card.tsx`
- **Tab 2: Routing proof** - shows query | features | predicted vs expected route | cost G vs V [for M-4]
- **Tab 3: Drill-down** - `verbatim-drilldown.tsx`, click 45 -> shows texts, hash check for hallucination
- **Tools:** Next.js 14, shadcn/ui, types generated from `/openapi.json`

### Layer 5: Evaluation [Player 3]
**Pytest + GitHub Actions**

**Golden Sets:** `data/golden/`
- `planted_issue_ground_truth.json` [20 planted issues]
- `router_golden.jsonl` [120 queries, 2 annotators, kappa>0.65] - THIS WAS MISSING = M-4 CRITICAL
- `eval_fixture.jsonl` [30 queries for citation]

**Metrics:**
- M-1 Detection Rate
- M-2 Lead Time vs monthly baseline
- M-3 Citation Accuracy [ID match + optional RAGAS faithfulness offline]
- M-4 Routing Correctness [accuracy + per-class recall]
- E13 Cost/query
- E14 Latency p50/p95

**Gates:** `eval-gate.yml` fails PR if lead time drops, routing accuracy <0.75, graph recall <0.70

**Tools:** Pytest, GitHub Actions, RAGAS offline only [not in CI]

---

## 4. Tech Stack Role Summary

| Tech | Role | Why not alternative |
| :--- | :--- | :--- |
| **Postgres + pgvector** | Single source for graph + vector + SQL aggregate | No Neo4j/Qdrant = low cost, low ops, one transaction for citation |
| **graph_nodes + graph_edges JSONB** | Implements property graph MODEL without Neo4j ENGINE | Expert pattern, not hack - SQL:2023 property graph standard |
| **LangGraph** | Thin router graph, not multi-agent | Blueprint says thin, proposal says no multi-agent expansion |
| **Pydantic contracts** | Single source of truth across layers | Prevents drift, required by proposal Section 5 |
| **FastAPI + asyncpg** | API + direct SQL, read-only role | Faster than MCP for detection, MCP optional only for ad-hoc tab |
| **sentence-transformers** | Embeddings, no LLM call in detection | Keeps cost low per blueprint page 63 |
| **Next.js + shadcn** | UI with attribution | Required for citation drill-down |
| **Pytest + eval-gate** | CI that blocks regression | Proves M-1 to M-4 reliably |

---

## 5. End-to-End Flow in 30 Seconds

```
Consumer text -> ingestion.py -> graph_nodes/edges + embedding -> Poisson scan detects spike in 3 days -> Router decides Graph vs Vector -> Retrieval gets 45 verbatims -> LLM generates insight with SourceRef -> UI shows card -> Evaluation logs lead time 27 days early + routing accuracy 0.81 + cost $0.02
```
