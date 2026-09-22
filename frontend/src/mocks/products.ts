import type { Product } from "@/lib/types.generated";
import { daysAgo, mockId } from "./seed";

export const products: Product[] = [
  { id: mockId(1), name: "Harbor Crisp", category: "Snacks", createdAt: daysAgo(420) },
  { id: mockId(2), name: "Northline Oats", category: "Breakfast", createdAt: daysAgo(400) },
  { id: mockId(3), name: "Cedar Brew", category: "Beverage", createdAt: daysAgo(380) },
  { id: mockId(4), name: "Marlowe Soup", category: "Meals", createdAt: daysAgo(360) },
  { id: mockId(5), name: "Fieldbar Granola", category: "Snacks", createdAt: daysAgo(340) },
];
