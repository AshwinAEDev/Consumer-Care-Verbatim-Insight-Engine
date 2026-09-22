// GENERATED — do not edit. Source: backend/src/ccvie/contracts/
// ponytail: Date fields, not ISO strings. api-client parses HTTP JSON when a route exists.

export const ISSUE_TYPES = ["packaging", "taste", "shipping", "freshness", "quantity", "quality", "damaged", "other"] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];
export const PACK_TYPES = ["bag", "box", "bottle", "can"] as const;
export type PackType = (typeof PACK_TYPES)[number];
export const VERBATIM_SOURCES = ["call", "email", "social", "review", "survey"] as const;
export type VerbatimSource = (typeof VERBATIM_SOURCES)[number];
export const ROUTE_DECISIONS = ["graph", "vector"] as const;
export type RouteDecision = (typeof ROUTE_DECISIONS)[number];

export interface Product {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
}
export interface Pack {
  id: string;
  productId: string;
  size: string;
  type: PackType;
  launchDate: Date;
}
export interface Region {
  id: string;
  name: string;
  code: string;
}
export interface Verbatim {
  id: string;
  text: string;
  productId: string;
  packId: string;
  regionId: string;
  issueType?: IssueType;
  source: VerbatimSource;
  timestamp: Date;
  customerSegment?: string;
}
export interface InsightResponse {
  id: string;
  title: string;
  summary: string;
  clusterSize: number;
  confidence: number;
  affectedProduct: string;
  affectedPack?: string;
  affectedRegion?: string;
  detectedAt: Date;
  verbatimIds: string[];
  leadTime?: number;
}
export interface QueryFilters {
  product?: string;
  region?: string;
  issueType?: string;
  timeWindow?: string;
}
export interface QueryRequest {
  text: string;
  filters?: QueryFilters;
}
