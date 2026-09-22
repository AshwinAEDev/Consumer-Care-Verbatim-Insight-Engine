"use client";

import type { InsightResponse } from "@/lib/types.generated";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { IssueTypeBadge } from "@/components/issue-type-badge";
import { TrendSparkline } from "@/components/trend-sparkline";
import { complaintLabel, leadTimeLabel } from "@/lib/labels";

const cardMotion = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

type InsightCardProps = {
  insight: InsightResponse;
  issueType?: string;
  timestamps: readonly Date[];
};

export function InsightCard({ insight, issueType, timestamps }: InsightCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full"
      variants={cardMotion}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/insight/${insight.id}`}
        className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {issueType ? <IssueTypeBadge issueType={issueType} /> : null}
              <ConfidenceBadge confidence={insight.confidence} />
            </div>
            <CardTitle className="line-clamp-2">{insight.title}</CardTitle>
            <p className="line-clamp-3 text-sm text-muted-foreground">{insight.summary}</p>
          </CardHeader>
          <CardContent className="mt-auto space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{insight.affectedProduct}</Badge>
              {insight.affectedPack ? <Badge variant="outline">{insight.affectedPack}</Badge> : null}
              {insight.affectedRegion ? (
                <Badge variant="outline">{insight.affectedRegion}</Badge>
              ) : null}
            </div>
            <TrendSparkline timestamps={timestamps} detectedAt={insight.detectedAt} />
          </CardContent>
          <CardFooter className="justify-between gap-3 text-sm">
            <span className="font-medium">{complaintLabel(insight.clusterSize)}</span>
            {insight.leadTime !== undefined ? (
              <span className="text-muted-foreground">{leadTimeLabel(insight.leadTime)}</span>
            ) : null}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
