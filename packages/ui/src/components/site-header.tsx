import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg tracking-tight">Nordbrook</span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Insights</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
