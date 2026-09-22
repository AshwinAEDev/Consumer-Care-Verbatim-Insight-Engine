"use client";

import type { InsightResponse, Verbatim } from "@/lib/types.generated";
import { motion, useReducedMotion } from "framer-motion";
import { InsightCard } from "@/components/insight-card";
import { Skeleton } from "@/components/ui/skeleton";

const listMotion = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

type InsightGridProps = {
  insights: readonly InsightResponse[];
  verbatims: readonly Verbatim[];
};

export function InsightGrid({ insights, verbatims }: InsightGridProps) {
  const reduceMotion = useReducedMotion();
  const byId = new Map(verbatims.map((verbatim) => [verbatim.id, verbatim]));

  if (insights.length === 0) {
    return <p className="text-sm text-muted-foreground">No insights in this window.</p>;
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      initial={reduceMotion ? "show" : "hidden"}
      animate="show"
      variants={listMotion}
    >
      {insights.map((insight) => {
        const cited = insight.verbatimIds.flatMap((id) => {
          const verbatim = byId.get(id);
          return verbatim ? [verbatim] : [];
        });
        return (
          <InsightCard
            key={insight.id}
            insight={insight}
            issueType={cited[0]?.issueType}
            timestamps={cited.map((verbatim) => verbatim.timestamp)}
          />
        );
      })}
    </motion.div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-72 rounded-xl" />
      ))}
    </div>
  );
}
