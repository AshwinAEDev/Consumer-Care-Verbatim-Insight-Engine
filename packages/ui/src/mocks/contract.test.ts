import {
  InsightSchema,
  IssueTypeSchema,
  PackSchema,
  ProductSchema,
  RegionSchema,
  VerbatimSchema,
} from "@ccvie/core";
import { describe, expect, it } from "vitest";
import { complaintLabel, formatPercent, leadTimeLabel } from "../lib/labels";
import { getInsightById, getInsights, getVerbatimsByIds } from "../lib/queries";
import { weeklyTrend } from "../lib/trend";
import { insights, packs, products, regions, verbatims } from "./index";

describe("mock contracts", () => {
  it.each(products)("product %# matches ProductSchema", (product) => {
    expect(ProductSchema.parse(product)).toEqual(product);
  });

  it.each(packs)("pack %# matches PackSchema", (pack) => {
    expect(PackSchema.parse(pack)).toEqual(pack);
  });

  it.each(regions)("region %# matches RegionSchema", (region) => {
    expect(RegionSchema.parse(region)).toEqual(region);
  });

  it.each(verbatims)("verbatim %# matches VerbatimSchema", (verbatim) => {
    expect(VerbatimSchema.parse(verbatim)).toEqual(verbatim);
  });

  it.each(insights)("insight %# matches InsightSchema", (insight) => {
    expect(InsightSchema.parse(insight)).toEqual(insight);
  });

  it("keeps relational ids and the 50-complaint set intact", () => {
    expect(products).toHaveLength(5);
    expect(regions).toHaveLength(6);
    expect(packs.length).toBeGreaterThanOrEqual(10);
    expect(packs.length).toBeLessThanOrEqual(12);

    const productIds = new Set(products.map((product) => product.id));
    const regionIds = new Set(regions.map((region) => region.id));
    const productNames = new Set(products.map((product) => product.name));
    const packById = new Map(packs.map((pack) => [pack.id, pack]));
    const verbatimIds = new Set(verbatims.map((verbatim) => verbatim.id));

    for (const pack of packs) {
      expect(productIds.has(pack.productId)).toBe(true);
    }

    for (const verbatim of verbatims) {
      expect(productIds.has(verbatim.productId)).toBe(true);
      expect(regionIds.has(verbatim.regionId)).toBe(true);
      expect(IssueTypeSchema.safeParse(verbatim.issueType).success).toBe(true);
      const pack = packById.get(verbatim.packId);
      expect(pack?.productId).toBe(verbatim.productId);
    }

    const seen = new Set<string>();
    const issueTypes = new Set<string>();
    let missingLeadTime = 0;

    for (const insight of insights) {
      expect(insight.clusterSize).toBe(insight.verbatimIds.length);
      expect(productNames.has(insight.affectedProduct)).toBe(true);
      if (insight.leadTime === undefined) {
        missingLeadTime += 1;
      }
      const cited = verbatims.filter((verbatim) => insight.verbatimIds.includes(verbatim.id));
      expect(new Set(cited.map((verbatim) => verbatim.issueType)).size).toBe(1);
      issueTypes.add(String(cited[0]?.issueType));
      for (const id of insight.verbatimIds) {
        expect(verbatimIds.has(id)).toBe(true);
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }

    expect(seen.size).toBe(verbatims.length);
    expect(insights.reduce((sum, insight) => sum + insight.clusterSize, 0)).toBe(50);
    expect(issueTypes.size).toBe(8);
    expect(missingLeadTime).toBe(2);
    expect(Math.min(...insights.map((insight) => insight.confidence))).toBeLessThan(0.7);
    expect(Math.max(...insights.map((insight) => insight.confidence))).toBeGreaterThanOrEqual(0.7);
  });
});

describe("labels", () => {
  it("does not call a non-positive lead time early", () => {
    expect(leadTimeLabel(9)).toBe("9 days early");
    expect(leadTimeLabel(0)).toBe("Same day as the monthly baseline");
    expect(leadTimeLabel(-2)).toBe("2 days after the monthly baseline");
  });

  it("pluralizes a count of one and formats the confidence ends", () => {
    expect(complaintLabel(1)).toBe("1 complaint");
    expect(complaintLabel(0)).toBe("0 complaints");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(1)).toBe("100%");
  });
});

describe("query seam", () => {
  it("returns every insight and drops unknown ids", async () => {
    const rows = await getInsights();
    expect(rows).toHaveLength(8);
    expect(await getInsightById("00000000-0000-4000-8000-000000000099")).toBeNull();
    expect(await getInsightById("")).toBeNull();
    expect(await getVerbatimsByIds([])).toEqual([]);
    const known = rows[0]?.verbatimIds[0];
    expect(known).toBeDefined();
    const found = await getVerbatimsByIds([known ?? "", "00000000-0000-4000-8000-000000000099"]);
    expect(found.map((verbatim) => verbatim.id)).toEqual([known]);
  });
});

describe("weeklyTrend", () => {
  it("returns nothing for an empty series or an invalid detection date", () => {
    expect(weeklyTrend([], new Date())).toEqual([]);
    expect(weeklyTrend([new Date()], new Date(Number.NaN))).toEqual([]);
    expect(weeklyTrend([new Date(Number.NaN)], new Date(2026, 8, 16, 12))).toEqual([]);
  });

  it("puts a single complaint on the detection week at the baseline", () => {
    const day = new Date(2026, 8, 16, 12);
    const points = weeklyTrend([day], day);
    expect(points).toHaveLength(1);
    expect(points[0]?.count).toBe(1);
    expect(points[0]?.baseline).toBe(1);
    expect(points[0]?.detected).toBe(true);
  });

  it("marks the detection week as the busiest week for every mock insight", () => {
    for (const insight of insights) {
      const timestamps = verbatims
        .filter((verbatim) => insight.verbatimIds.includes(verbatim.id))
        .map((verbatim) => verbatim.timestamp);
      const points = weeklyTrend(timestamps, insight.detectedAt);
      const detected = points.find((point) => point.detected);
      const mean = points.reduce((sum, point) => sum + point.count, 0) / points.length;
      expect(points.length).toBeGreaterThan(1);
      expect(detected).toBeDefined();
      expect(detected?.count).toBe(Math.max(...points.map((point) => point.count)));
      expect(points[0]?.baseline).toBeCloseTo(mean);
    }
  });
});
