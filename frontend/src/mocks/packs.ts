import type { Pack } from "@/lib/types.generated";
import { daysAgo, mockId } from "./seed";

export const packs: Pack[] = [
  { id: mockId(11), productId: mockId(1), size: "8 oz resealable bag", type: "bag", launchDate: daysAgo(70) },
  { id: mockId(12), productId: mockId(1), size: "12 ct carton", type: "box", launchDate: daysAgo(200) },
  { id: mockId(13), productId: mockId(2), size: "18 oz pouch", type: "bag", launchDate: daysAgo(180) },
  { id: mockId(14), productId: mockId(2), size: "6 ct box", type: "box", launchDate: daysAgo(160) },
  { id: mockId(15), productId: mockId(3), size: "12 oz grounds", type: "bag", launchDate: daysAgo(150) },
  { id: mockId(16), productId: mockId(3), size: "8 oz cold brew bottle", type: "bottle", launchDate: daysAgo(90) },
  { id: mockId(17), productId: mockId(4), size: "15 oz can", type: "can", launchDate: daysAgo(220) },
  { id: mockId(18), productId: mockId(4), size: "4 ct carton", type: "box", launchDate: daysAgo(210) },
  { id: mockId(19), productId: mockId(5), size: "10 oz bag", type: "bag", launchDate: daysAgo(140) },
  { id: mockId(20), productId: mockId(5), size: "16 oz bag", type: "bag", launchDate: daysAgo(130) },
  { id: mockId(21), productId: mockId(5), size: "8 ct box", type: "box", launchDate: daysAgo(120) },
];
