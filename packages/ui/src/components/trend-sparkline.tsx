"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { weeklyTrend } from "@/lib/trend";

type TrendSparklineProps = {
  timestamps: readonly Date[];
  detectedAt: Date;
};

export function TrendSparkline({ timestamps, detectedAt }: TrendSparklineProps) {
  const points = weeklyTrend(timestamps, detectedAt);
  if (points.length === 0) {
    return <p className="text-xs text-muted-foreground">No dated complaints yet.</p>;
  }

  const last = points[points.length - 1];
  return (
    <div
      className="h-10 w-full"
      role="img"
      aria-label={`Weekly complaints, ${last?.count ?? 0} in the latest week`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--foreground))"
            fill="hsl(var(--foreground))"
            fillOpacity={0.12}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
