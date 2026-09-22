const MAX_WEEKS = 52;

export type WeekPoint = {
  label: string;
  count: number;
  baseline: number;
  detected: boolean;
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - mondayOffset);
  return start;
}

export function weeklyTrend(timestamps: readonly Date[], detectedAt: Date): WeekPoint[] {
  if (Number.isNaN(detectedAt.getTime())) {
    return [];
  }

  const valid = timestamps.filter((timestamp) => !Number.isNaN(timestamp.getTime()));
  if (valid.length === 0) {
    return [];
  }

  const detectedWeek = startOfWeek(detectedAt);
  const weekStarts = valid.map((timestamp) => startOfWeek(timestamp));
  const last = new Date(
    Math.max(detectedWeek.getTime(), ...weekStarts.map((week) => week.getTime()))
  );
  let cursor = new Date(
    Math.min(detectedWeek.getTime(), ...weekStarts.map((week) => week.getTime()))
  );
  const earliestKept = new Date(last);
  earliestKept.setDate(earliestKept.getDate() - (MAX_WEEKS - 1) * 7);
  if (cursor < earliestKept) {
    cursor = earliestKept;
  }

  const points: Array<Omit<WeekPoint, "label" | "baseline"> & { week: Date }> = [];
  let guard = 0;
  while (guard < MAX_WEEKS) {
    const key = dayKey(cursor);
    const count = valid.filter((timestamp) => dayKey(startOfWeek(timestamp)) === key).length;
    points.push({
      week: new Date(cursor),
      count,
      detected: key === dayKey(detectedWeek),
    });
    if (key === dayKey(last)) {
      break;
    }
    cursor.setDate(cursor.getDate() + 7);
    guard += 1;
  }

  const mean = points.reduce((sum, point) => sum + point.count, 0) / points.length;
  const crossesYear = new Set(points.map((point) => point.week.getFullYear())).size > 1;
  const format = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: crossesYear ? "numeric" : undefined,
  });

  return points.map((point) => ({
    label: format.format(point.week),
    count: point.count,
    baseline: mean,
    detected: point.detected,
  }));
}
