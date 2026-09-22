import type { InsightResponse, Verbatim } from "@/lib/types.generated";

// HTTP replaces these bodies when the API has routes. Callers keep these return types.
import { insights, verbatims } from "@/mocks";

export function getInsights(): Promise<InsightResponse[]> {
  return Promise.resolve(insights);
}

export function getInsightById(id: string): Promise<InsightResponse | null> {
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
