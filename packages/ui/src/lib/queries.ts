import type { Insight, Verbatim } from "@ccvie/core";

// Phase 2 replaces the bodies with HTTP. Callers keep these return types.
import { insights, verbatims } from "@/mocks";

export function getInsights(): Promise<Insight[]> {
  return Promise.resolve(insights);
}

export function getInsightById(id: string): Promise<Insight | null> {
  return Promise.resolve(insights.find((insight) => insight.id === id) ?? null);
}

export function getVerbatimsByIds(ids: readonly string[]): Promise<Verbatim[]> {
  const byId = new Map(verbatims.map((verbatim) => [verbatim.id, verbatim]));
  return Promise.resolve(
    ids.flatMap((id) => {
      const verbatim = byId.get(id);
      return verbatim ? [verbatim] : [];
    })
  );
}
