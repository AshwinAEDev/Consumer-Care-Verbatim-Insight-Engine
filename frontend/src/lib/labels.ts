export function complaintLabel(count: number): string {
  return `${count} ${count === 1 ? "complaint" : "complaints"}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatStatDays(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} days` : `${rounded.toFixed(1)} days`;
}

export function leadTimeLabel(days: number): string {
  if (days > 0) {
    return `${days} days early`;
  }
  if (days === 0) {
    return "Same day as the monthly baseline";
  }
  return `${Math.abs(days)} days after the monthly baseline`;
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
