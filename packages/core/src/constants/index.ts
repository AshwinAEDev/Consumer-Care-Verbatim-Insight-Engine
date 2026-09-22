export const GRAPH_DB_TIMEOUT_MS = 5000;
export const VECTOR_SEARCH_TOP_K = 20;
export const CLUSTERING_MIN_CLUSTER_SIZE = 3;
export const CONFIDENCE_THRESHOLD = 0.7;

export const ISSUE_TYPES = [
  "packaging",
  "taste",
  "shipping",
  "freshness",
  "quantity",
  "quality",
  "damaged",
  "other",
] as const;

export const VERBATIM_SOURCES = ["call", "email", "social", "review", "survey"] as const;

export const ROUTER_DECISION_THRESHOLD = 0.6;
