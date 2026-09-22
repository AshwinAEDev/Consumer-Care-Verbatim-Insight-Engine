"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { weeklyTrend } from "@/lib/trend";

type TrendChartProps = {
  timestamps: readonly Date[];
  detectedAt: Date;
};

export function TrendChart({ timestamps, detectedAt }: TrendChartProps) {
  const points = weeklyTrend(timestamps, detectedAt);
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No dated complaints to plot.</p>;
  }

  const baseline = points[0]?.baseline ?? 0;
  const detected = points.find((point) => point.detected);

  return (
    <figure className="space-y-3">
      <figcaption className="text-sm text-muted-foreground">
        Weekly complaints against the flat average a monthly report would imply. The dot marks
        when this cluster was detected.
      </figcaption>
      <div className="h-72 w-full" role="img" aria-label="Weekly complaint trend with detection marker">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis
              allowDecimals={false}
              width={32}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Complaints"
              stroke="hsl(var(--foreground))"
              fill="hsl(var(--foreground))"
              fillOpacity={0.14}
              strokeWidth={2}
            />
            <ReferenceLine
              y={baseline}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              label={{
                value: "Monthly average",
                position: "insideTopRight",
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            {detected ? (
              <ReferenceDot
                x={detected.label}
                y={detected.count}
                r={5}
                fill="hsl(var(--foreground))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
                label={{ value: "Detected", position: "top", fontSize: 12, fill: "hsl(var(--foreground))" }}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
