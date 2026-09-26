import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/labels";
import { routerGoldenQueries as rows } from "@/mocks/router-golden";

export default function RoutingPage() {
  const correct = rows.filter((row) => row.predictedRoute === row.expectedRoute);
  const accuracy = correct.length / rows.length;

  const byClass = new Map<string, { total: number; correct: number }>();
  for (const row of rows) {
    const entry = byClass.get(row.expectedRoute) ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (row.predictedRoute === row.expectedRoute) {
      entry.correct += 1;
    }
    byClass.set(row.expectedRoute, entry);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Nordbrook Foods · Consumer care
        </p>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Routing proof</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          The labeled query set from <code>data/golden/router_labeled_queries.json</code>, run
          against the threshold rules in <code>config.py</code>.
        </p>
      </div>
      <section aria-label="Routing accuracy" className="flex flex-wrap gap-4">
        <Badge variant="outline" className="text-sm">
          Accuracy {formatPercent(accuracy)} ({correct.length}/{rows.length})
        </Badge>
        {[...byClass.entries()].map(([route, entry]) => (
          <Badge key={route} variant="outline" className="text-sm">
            {route} recall {formatPercent(entry.correct / entry.total)}
          </Badge>
        ))}
      </section>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Query</th>
              <th className="px-4 py-3">Entity count</th>
              <th className="px-4 py-3">Taxonomy coverage</th>
              <th className="px-4 py-3">Predicted</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Correct</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, index) => {
              const isCorrect = row.predictedRoute === row.expectedRoute;
              return (
                <tr key={`${row.query}-${index}`}>
                  <td className="max-w-md px-4 py-3">{row.query}</td>
                  <td className="px-4 py-3 tabular-nums">{row.entityCount}</td>
                  <td className="px-4 py-3 tabular-nums">{row.taxonomyCoverage.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{row.predictedRoute}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{row.expectedRoute}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {isCorrect ? (
                      <Check className="h-4 w-4 text-primary" aria-label="Correct" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" aria-label="Incorrect" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
