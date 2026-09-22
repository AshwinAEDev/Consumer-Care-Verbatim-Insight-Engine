"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { CONFIDENCE_THRESHOLD, ConfidenceBadge } from "@/components/confidence-badge";
import { IssueTypeBadge } from "@/components/issue-type-badge";
import { TrendChart } from "@/components/trend-chart";
import { VerbatimDrilldown } from "@/components/verbatim-drilldown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { complaintLabel, formatTimestamp, leadTimeLabel } from "@/lib/labels";
import { getInsightById, getVerbatimsByIds } from "@/lib/api-client";

export default function InsightPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const insightQuery = useQuery({
    queryKey: ["insight", id],
    queryFn: () => getInsightById(id),
  });
  const verbatimQuery = useQuery({
    queryKey: ["verbatims", insightQuery.data?.verbatimIds ?? []],
    queryFn: () => getVerbatimsByIds(insightQuery.data?.verbatimIds ?? []),
    enabled: Boolean(insightQuery.data),
  });

  if (insightQuery.isLoading) {
    return <DrilldownFallback />;
  }
  if (insightQuery.isError) {
    return <p role="alert">This insight could not be loaded.</p>;
  }
  if (!insightQuery.data) {
    notFound();
  }
  if (verbatimQuery.isLoading) {
    return <DrilldownFallback />;
  }
  if (verbatimQuery.isError) {
    return <p role="alert">Source complaints could not be loaded.</p>;
  }

  const insight = insightQuery.data;
  const rows = verbatimQuery.data ?? [];
  const issueType = rows[0]?.issueType;
  const threshold = Math.round(CONFIDENCE_THRESHOLD * 100);

  return (
    <div className="space-y-8">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          All insights
        </Link>
      </Button>
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {issueType ? <IssueTypeBadge issueType={issueType} /> : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ConfidenceBadge confidence={insight.confidence} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Share of cited complaints that support this claim. High means {threshold}% or above.
            </TooltipContent>
          </Tooltip>
          {insight.leadTime !== undefined ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Badge>{leadTimeLabel(insight.leadTime)}</Badge>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Days earlier than a monthly rollup would have surfaced this cluster.
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <h1 className="max-w-3xl font-display text-4xl tracking-tight">{insight.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{insight.summary}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{insight.affectedProduct}</Badge>
          {insight.affectedPack ? <Badge variant="outline">{insight.affectedPack}</Badge> : null}
          {insight.affectedRegion ? <Badge variant="outline">{insight.affectedRegion}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {complaintLabel(insight.clusterSize)} · detected {formatTimestamp(insight.detectedAt)}
        </p>
      </header>
      <TrendChart
        timestamps={rows.map((verbatim) => verbatim.timestamp)}
        detectedAt={insight.detectedAt}
      />
      <VerbatimDrilldown
        verbatims={rows}
        citedCount={insight.clusterSize}
        regionLabel={insight.affectedRegion}
      />
    </div>
  );
}

function DrilldownFallback() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
