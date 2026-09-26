"use client";

import { useQuery } from "@tanstack/react-query";
import { FeedSkeleton, InsightGrid } from "@/components/insight-grid";
import { Separator } from "@/components/ui/separator";
import { formatPercent, formatStatDays, formatUsd } from "@/lib/labels";
import { getInsights, getVerbatimsByIds } from "@/lib/api-client";
import type { InsightResponse } from "@/lib/types.generated";

function averageLeadTime(insights: readonly InsightResponse[]): number | null {
  const samples = insights.flatMap((insight) =>
    insight.leadTime === undefined ? [] : [insight.leadTime]
  );
  if (samples.length === 0) {
    return null;
  }
  return samples.reduce((sum, value) => sum + value, 0) / samples.length;
}

function peakConfidence(insights: readonly InsightResponse[]): number | null {
  if (insights.length === 0) {
    return null;
  }
  return insights.reduce((max, insight) => Math.max(max, insight.confidence), 0);
}

function averageCostUsd(insights: readonly InsightResponse[]): number | null {
  const samples = insights.flatMap((insight) =>
    insight.costUsd === undefined ? [] : [insight.costUsd]
  );
  if (samples.length === 0) {
    return null;
  }
  return samples.reduce((sum, value) => sum + value, 0) / samples.length;
}

export default function FeedPage() {
  const insightQuery = useQuery({ queryKey: ["insights"], queryFn: getInsights });
  const ids = insightQuery.data?.flatMap((insight) => insight.verbatimIds) ?? [];
  const verbatimQuery = useQuery({
    queryKey: ["verbatims", ids],
    queryFn: () => getVerbatimsByIds(ids),
    enabled: Boolean(insightQuery.data),
  });

  const insights = insightQuery.data ?? [];
  const average = averageLeadTime(insights);
  const peak = peakConfidence(insights);
  const avgCost = averageCostUsd(insights);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Nordbrook Foods · Consumer care
        </p>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">What is emerging</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Clusters the monthly rollup still averages away. Open a card to read the complaints
          behind the count.
        </p>
      </div>
      <section
        aria-label="Insight summary"
        className="grid grid-cols-1 overflow-hidden rounded-xl border bg-card sm:grid-cols-4"
      >
        <Stat label="Active insights" value={insightQuery.data ? String(insights.length) : "—"} />
        <Separator className="sm:hidden" />
        <Stat label="Avg lead time" value={average === null ? "—" : formatStatDays(average)} />
        <Separator className="sm:hidden" />
        <Stat label="Peak confidence" value={peak === null ? "—" : formatPercent(peak)} />
        <Separator className="sm:hidden" />
        <Stat label="Avg cost/query" value={avgCost === null ? "—" : formatUsd(avgCost)} />
      </section>
      {insightQuery.isError || verbatimQuery.isError ? (
        <p role="alert">Insights could not be loaded.</p>
      ) : insightQuery.isLoading || (insightQuery.data && verbatimQuery.isLoading) ? (
        <FeedSkeleton />
      ) : (
        <InsightGrid insights={insights} verbatims={verbatimQuery.data ?? []} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 sm:border-l sm:first:border-l-0">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
