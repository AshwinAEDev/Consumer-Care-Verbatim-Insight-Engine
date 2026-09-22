# 🔍 CCVIE — Consumer Care Verbatim Insight Engine

**Early detection of emerging product issues from customer feedback.**

## Layout

```
backend/src/ccvie/     Python. Layers 1, 2, 3, and 5. Contracts live in contracts/.
frontend/              Next.js attribution UI (Layer 4).
```

| Layer | Path |
|---|---|
| Data foundation | `backend/src/ccvie/data_foundation/` (PostgreSQL + pgvector) |
| Router | `backend/src/ccvie/router/` |
| Retrieval and API | `backend/src/ccvie/retrieval_gen/` |
| Attribution UI | `frontend/` |
| Evaluation | `backend/src/ccvie/evaluation/` |

API shapes are the Pydantic models in `backend/src/ccvie/contracts/`. `pnpm gen-types` writes `frontend/src/lib/types.generated.ts` from those models.

## How to run

Two processes. The UI does not call the API yet. Each one starts on its own.

### UI (Node)

From the repo root. Node 22+ and pnpm 9.

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install
pnpm dev
```

`pnpm dev` starts the Next.js app at http://localhost:3000.

UI checks only:

```bash
pnpm --filter frontend run test
pnpm --filter frontend run type-check
pnpm gen-types
```

### API (Python)

From the repo root. Python 3.11+.

```bash
copy .env.example .env
python -m pip install -e backend
python -m uvicorn ccvie.retrieval_gen.api:app --app-dir backend/src --reload --port 8000
```

The API listens on http://localhost:8000. Interactive docs are at http://localhost:8000/docs. On Windows, use `py -3` if `python` is not on PATH. `copy` is the Windows command; on macOS or Linux use `cp .env.example .env`. The app defines no routes yet.

### Other root scripts

```bash
pnpm build
pnpm test
pnpm type-check
pnpm lint
```

## Documentation

Folder layout and stack rules: `reference_doc/create-a-code-base-radiant-salamander.md`.
