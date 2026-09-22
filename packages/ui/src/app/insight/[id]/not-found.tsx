import Link from "next/link";

export default function InsightNotFound() {
  return (
    <div className="space-y-3 py-16">
      <h1 className="font-display text-3xl tracking-tight">Insight not found</h1>
      <p className="text-sm text-muted-foreground">This insight is not in the current set.</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        All insights
      </Link>
    </div>
  );
}
