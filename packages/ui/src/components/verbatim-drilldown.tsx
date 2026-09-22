"use client";

import type { Verbatim } from "@ccvie/core";
import { VERBATIM_SOURCES } from "@ccvie/core";
import { ClipboardList, Mail, MessagesSquare, Phone, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { complaintLabel, formatTimestamp } from "@/lib/labels";

const sourceMeta: Record<(typeof VERBATIM_SOURCES)[number], { label: string; icon: LucideIcon }> = {
  call: { label: "Calls", icon: Phone },
  email: { label: "Email", icon: Mail },
  social: { label: "Social", icon: MessagesSquare },
  review: { label: "Reviews", icon: Star },
  survey: { label: "Surveys", icon: ClipboardList },
};

type VerbatimDrilldownProps = {
  verbatims: readonly Verbatim[];
  citedCount: number;
  regionLabel?: string;
};

export function VerbatimDrilldown({ verbatims, citedCount, regionLabel }: VerbatimDrilldownProps) {
  const ordered = [...verbatims].sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime());
  const groups = new Map<Verbatim["source"], Verbatim[]>();
  for (const verbatim of ordered) {
    const list = groups.get(verbatim.source);
    if (list) {
      list.push(verbatim);
    } else {
      groups.set(verbatim.source, [verbatim]);
    }
  }

  const sources = VERBATIM_SOURCES.filter((source) => groups.has(source));

  return (
    <section className="space-y-3" aria-labelledby="sources-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sources-heading" className="font-display text-2xl tracking-tight">
          Source complaints
        </h2>
        <p className="text-sm text-muted-foreground">
          {ordered.length === citedCount
            ? complaintLabel(ordered.length)
            : `Showing ${ordered.length} of ${complaintLabel(citedCount)}`}
        </p>
      </div>
      {sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">No source complaints attached to this insight.</p>
      ) : (
        <Tabs defaultValue={sources[0]}>
          <TabsList>
            {sources.map((source) => {
              const meta = sourceMeta[source];
              const Icon = meta.icon;
              return (
                <TabsTrigger key={source} value={source}>
                  <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  {meta.label}
                  <span className="ml-1.5 text-muted-foreground">{groups.get(source)?.length ?? 0}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {sources.map((source) => (
            <TabsContent key={source} value={source}>
              <ScrollArea className="h-[420px] rounded-xl border">
                <ul className="divide-y">
                  {(groups.get(source) ?? []).map((verbatim) => {
                    const Icon = sourceMeta[verbatim.source].icon;
                    return (
                      <li key={verbatim.id} className="space-y-2 px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                          <time dateTime={verbatim.timestamp.toISOString()}>
                            {formatTimestamp(verbatim.timestamp)}
                          </time>
                          {regionLabel ? <Badge variant="outline">{regionLabel}</Badge> : null}
                        </div>
                        <p className="text-sm leading-6">{verbatim.text}</p>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </section>
  );
}
