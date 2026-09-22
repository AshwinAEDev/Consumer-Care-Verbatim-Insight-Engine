import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  packaging: "Packaging",
  taste: "Taste",
  shipping: "Shipping",
  freshness: "Freshness",
  quantity: "Quantity",
  quality: "Quality",
  damaged: "Damaged",
  other: "Other",
};

type IssueTypeBadgeProps = {
  issueType: string;
};

export function IssueTypeBadge({ issueType }: IssueTypeBadgeProps) {
  const label = labels[issueType] ?? issueType;
  return <Badge variant="secondary">{label}</Badge>;
}
