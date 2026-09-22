import type { Insight, IssueType } from "@ccvie/core";
import { mockId } from "./seed";
import { clusters } from "./verbatims";

const copy: Record<
  IssueType,
  { title: string; summary: string; confidence: number; leadTime?: number }
> = {
  packaging: {
    title: "Harbor Crisp bags are not resealing in the Pacific Northwest",
    summary:
      "Twelve complaints in the Pacific Northwest say the new 8 oz resealable bag opens in the pantry and the crackers go soft. The count jumped this week, ahead of the monthly packaging average.",
    confidence: 0.96,
    leadTime: 9,
  },
  freshness: {
    title: "Northline Oats pouches smell stale across the Midwest",
    summary:
      "Eight Midwest complaints describe soft, sour oats in 18 oz pouches that are still inside the printed date. The spike is concentrated in the latest week of arrivals.",
    confidence: 0.91,
    leadTime: 7,
  },
  taste: {
    title: "Cedar Brew grounds taste burnt in the Northeast",
    summary:
      "Seven Northeast complaints say the latest 12 oz grounds are harsh and ashy against the usual cocoa finish. Callers compared the same brew method with last month and blamed the lot.",
    confidence: 0.84,
    leadTime: 6,
  },
  shipping: {
    title: "Marlowe Soup cans are arriving crushed in the Southeast",
    summary:
      "Six Southeast deliveries arrived late with dented or leaking 15 oz cans. The damage shows up in the shipping notes, not in a plant-quality complaint.",
    confidence: 0.78,
    leadTime: 4,
  },
  quality: {
    title: "Fieldbar Granola is clumping in the Southwest",
    summary:
      "Five Southwest bags of the 10 oz granola arrived as hard clumps or fine dust. Shoppers in Phoenix, Tucson, and Albuquerque described the same texture.",
    confidence: 0.74,
    leadTime: 3,
  },
  damaged: {
    title: "Harbor Crisp cartons are crushed in the Mountain West",
    summary:
      "Five Mountain West complaints found 12 ct cartons caved in on the shelf, with sleeves already powder. This is shelf damage, separate from the reseal failure on the bag.",
    confidence: 0.71,
    leadTime: 2,
  },
  quantity: {
    title: "Northline Oats 6 ct boxes are short a pouch",
    summary:
      "Four Pacific Northwest boxes sold as a 6 count contained five pouches, with the empty slot still glued shut. The cluster is small and has no measured lead time yet.",
    confidence: 0.66,
  },
  other: {
    title: "Cedar Brew bottle labels disagree with the cap",
    summary:
      "Three Midwest cold brew bottles show a roast or flavor on the cap that the front label does not match. The notes are too mixed to time against the monthly baseline.",
    confidence: 0.63,
  },
};

export const insights: Insight[] = clusters.map((cluster, index) => {
  const text = copy[cluster.issueType];
  const insight: Insight = {
    id: mockId(41 + index),
    title: text.title,
    summary: text.summary,
    clusterSize: cluster.verbatimIds.length,
    confidence: text.confidence,
    affectedProduct: cluster.productName,
    affectedPack: cluster.packLabel,
    affectedRegion: cluster.regionName,
    detectedAt: cluster.detectedAt,
    verbatimIds: cluster.verbatimIds,
  };
  if (text.leadTime !== undefined) {
    insight.leadTime = text.leadTime;
  }
  return insight;
});
