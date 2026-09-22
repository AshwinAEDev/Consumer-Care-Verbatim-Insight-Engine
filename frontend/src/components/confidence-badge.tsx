import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/labels";

export const CONFIDENCE_THRESHOLD = 0.7;
const mediumFloor = 0.5;

type ConfidenceTier = "high" | "medium" | "low";

function confidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= CONFIDENCE_THRESHOLD) {
    return "high";
  }
  if (confidence >= mediumFloor) {
    return "medium";
  }
  return "low";
}

const tierClass: Record<ConfidenceTier, string> = {
  high: "border-transparent bg-primary text-primary-foreground",
  medium: "border-transparent bg-secondary text-secondary-foreground",
  low: "border-transparent bg-muted text-muted-foreground",
};

type ConfidenceBadgeProps = {
  confidence: number;
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const tier = confidenceTier(confidence);
  return <Badge className={tierClass[tier]}>{formatPercent(confidence)} confidence</Badge>;
}
