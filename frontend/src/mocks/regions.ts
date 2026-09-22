import type { Region } from "@/lib/types.generated";
import { mockId } from "./seed";

export const regions: Region[] = [
  { id: mockId(31), name: "Pacific Northwest", code: "PNW" },
  { id: mockId(32), name: "Southwest", code: "SW" },
  { id: mockId(33), name: "Midwest", code: "MW" },
  { id: mockId(34), name: "Northeast", code: "NE" },
  { id: mockId(35), name: "Southeast", code: "SE" },
  { id: mockId(36), name: "Mountain West", code: "MTW" },
];
