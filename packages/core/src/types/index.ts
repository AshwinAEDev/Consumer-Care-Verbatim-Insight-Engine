import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  createdAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;

export const PackSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  size: z.string(),
  type: z.enum(["bag", "box", "bottle", "can"]),
  launchDate: z.date(),
});

export type Pack = z.infer<typeof PackSchema>;

export const RegionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
});

export type Region = z.infer<typeof RegionSchema>;

export const IssueTypeSchema = z.enum([
  "packaging",
  "taste",
  "shipping",
  "freshness",
  "quantity",
  "quality",
  "damaged",
  "other",
]);

export type IssueType = z.infer<typeof IssueTypeSchema>;

export const VerbatimSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  productId: z.string().uuid(),
  packId: z.string().uuid(),
  regionId: z.string().uuid(),
  issueType: z.string().optional(),
  source: z.enum(["call", "email", "social", "review", "survey"]),
  timestamp: z.date(),
  customerSegment: z.string().optional(),
});

export type Verbatim = z.infer<typeof VerbatimSchema>;

export const InsightSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  clusterSize: z.number().int().positive(),
  confidence: z.number().min(0).max(1),
  affectedProduct: z.string(),
  affectedPack: z.string().optional(),
  affectedRegion: z.string().optional(),
  detectedAt: z.date(),
  verbatimIds: z.array(z.string().uuid()),
  leadTime: z.number().optional(),
});

export type Insight = z.infer<typeof InsightSchema>;

export const RouterDecisionSchema = z.enum(["graph", "vector"]);
export type RouterDecision = z.infer<typeof RouterDecisionSchema>;

export const QuerySchema = z.object({
  text: z.string(),
  filters: z
    .object({
      product: z.string().optional(),
      region: z.string().optional(),
      issueType: z.string().optional(),
      timeWindow: z.string().optional(),
    })
    .optional(),
});

export type Query = z.infer<typeof QuerySchema>;
