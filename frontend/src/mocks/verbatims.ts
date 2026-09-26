import { VERBATIM_SOURCES, type IssueType, type Verbatim } from "@/lib/types.generated";
import { shortHash } from "@/lib/hash";
import { startOfWeek } from "../lib/trend";
import { daysAgo, mockId } from "./seed";

export type ClusterMeta = {
  issueType: IssueType;
  verbatimIds: string[];
  detectedAt: Date;
  productName: string;
  packLabel: string;
  regionName: string;
};

type Spec = {
  issueType: IssueType;
  productId: string;
  packId: string;
  regionId: string;
  productName: string;
  packLabel: string;
  regionName: string;
  idStart: number;
  detectedDaysAgo: number;
  lines: readonly string[];
};

function timestampFor(detectedAt: Date, index: number, total: number): Date {
  const spikeCount = Math.max(1, Math.ceil(total * 0.5));
  if (index >= total - spikeCount) {
    const stamped = new Date(detectedAt);
    stamped.setHours(stamped.getHours() - (index % 5));
    const weekStart = startOfWeek(detectedAt);
    if (stamped < weekStart) {
      return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate(), 12, 0, 0, 0);
    }
    return stamped;
  }

  const weeksBack = 1 + (index % 4);
  const stamped = new Date(detectedAt);
  stamped.setDate(stamped.getDate() - weeksBack * 7);
  stamped.setHours(10, (index * 13) % 60, 0, 0);
  return stamped;
}

function build(spec: Spec): { meta: ClusterMeta; rows: Verbatim[] } {
  const detectedAt = daysAgo(spec.detectedDaysAgo, 15);
  const rows: Verbatim[] = spec.lines.map((text, index) => ({
    id: mockId(spec.idStart + index),
    text,
    productId: spec.productId,
    packId: spec.packId,
    regionId: spec.regionId,
    issueType: spec.issueType,
    source: VERBATIM_SOURCES[index % VERBATIM_SOURCES.length],
    timestamp: timestampFor(detectedAt, index, spec.lines.length),
    verbatimHash: shortHash(`${spec.idStart + index}:${text}`),
  }));

  return {
    meta: {
      issueType: spec.issueType,
      verbatimIds: rows.map((row) => row.id),
      detectedAt,
      productName: spec.productName,
      packLabel: spec.packLabel,
      regionName: spec.regionName,
    },
    rows,
  };
}

const specs: Spec[] = [
  {
    issueType: "packaging",
    productId: mockId(1),
    packId: mockId(11),
    regionId: mockId(31),
    productName: "Harbor Crisp",
    packLabel: "8 oz resealable bag",
    regionName: "Pacific Northwest",
    idStart: 101,
    detectedDaysAgo: 2,
    lines: [
      "The new seal on the Harbor Crisp bag popped open in the pantry and the crackers went soft overnight.",
      "Bought the resealable bag in Seattle. The zipper does not catch, so the pack is stale by day two.",
      "Second bag this month from the Portland store. The closure looks shut and is not.",
      "Kids opened one serving and the rest of the bag would not reseal. Whole pack wasted.",
      "The redesigned zipper tab tears off the first time I close it.",
      "Compared with the old carton, this bag lets air in. Crackers taste like cardboard.",
      "Three bags from the same Tacoma lot all failed to close after the first open.",
      "The seal looks melted along one edge. I returned it at the Bellevue store.",
      "I can press the zipper shut and it springs back open on the counter.",
      "Travel pack in my bag opened itself. Crumbs everywhere, crackers stale.",
      "Customer service sent a replacement bag and that one failed the same way.",
      "The closure works once, then the track splits. This started with the new bag artwork.",
    ],
  },
  {
    issueType: "freshness",
    productId: mockId(2),
    packId: mockId(13),
    regionId: mockId(33),
    productName: "Northline Oats",
    packLabel: "18 oz pouch",
    regionName: "Midwest",
    idStart: 201,
    detectedDaysAgo: 4,
    lines: [
      "The oats smelled stale the day I opened a pouch that was months from the date.",
      "Chicago store. Northline oats were soft and slightly sour, not the usual toast smell.",
      "Two pouches from the same case in Madison both smelled like a damp cupboard.",
      "I cook these every morning. This batch tastes old before it hits the pot.",
      "The pouch was puffed when I bought it in Minneapolis. Oats inside were limp.",
      "Best-by date is fine and the product still smells rancid.",
      "My usual Des Moines shop had a whole shelf of soft pouches. I opened one to check.",
      "The oats clump and smell like wet cardboard. I threw out the pouch.",
    ],
  },
  {
    issueType: "taste",
    productId: mockId(3),
    packId: mockId(15),
    regionId: mockId(34),
    productName: "Cedar Brew",
    packLabel: "12 oz grounds",
    regionName: "Northeast",
    idStart: 301,
    detectedDaysAgo: 6,
    lines: [
      "Cedar Brew grounds from the new lot taste burnt and bitter, not the usual cocoa finish.",
      "Same scoop, same machine, and this bag from Boston is harsh all the way down.",
      "I bought two bags in Providence. Both taste scorched compared with last month.",
      "The aroma is smoky in a bad way. My usual pour-over is undrinkable.",
      "Office kitchen in Hartford went through one bag. Three people said it tastes ashy.",
      "I thought my grinder was dirty. A fresh bag of the same lot is still bitter.",
      "This used to be my daily coffee. The latest Northeast bags taste over-roasted.",
    ],
  },
  {
    issueType: "shipping",
    productId: mockId(4),
    packId: mockId(17),
    regionId: mockId(35),
    productName: "Marlowe Soup",
    packLabel: "15 oz can",
    regionName: "Southeast",
    idStart: 401,
    detectedDaysAgo: 3,
    lines: [
      "The case arrived in Atlanta with half the cans dented and one leaking in the box.",
      "Delivery to Charleston left the cans crushed under a heavier parcel.",
      "Two-day shipping took six days and the soup cans were warm and dented.",
      "The outer box was split. Three cans had rim damage and would not stack.",
      "Carrier left the case in the rain in Savannah. Labels peeled and two cans dented.",
      "Subscription box showed up late with a crushed corner and a leaking Marlowe can.",
    ],
  },
  {
    issueType: "quality",
    productId: mockId(5),
    packId: mockId(19),
    regionId: mockId(32),
    productName: "Fieldbar Granola",
    packLabel: "10 oz bag",
    regionName: "Southwest",
    idStart: 501,
    detectedDaysAgo: 5,
    lines: [
      "The granola is one solid brick. I had to break it with a spoon.",
      "Phoenix bag was full of fine dust instead of clusters. It tastes stale-sweet.",
      "Hard clumps the size of a walnut in a bag I bought in Tucson yesterday.",
      "The oats look under-baked and the clusters fall into powder when I pour.",
      "Second bag from the Albuquerque store. Same cement-like clumps at the bottom.",
    ],
  },
  {
    issueType: "damaged",
    productId: mockId(1),
    packId: mockId(12),
    regionId: mockId(36),
    productName: "Harbor Crisp",
    packLabel: "12 ct carton",
    regionName: "Mountain West",
    idStart: 601,
    detectedDaysAgo: 8,
    lines: [
      "The carton was crushed on the shelf in Denver. Half the sleeves inside were broken.",
      "Bought a 12 count in Salt Lake. The box was resealed with tape and crackers were dust.",
      "Corner of the carton was caved in. Crackers in the front sleeves were powder.",
      "Boise store. The display carton was torn open and the inner bags were split.",
      "I opened a new carton and two sleeves were already crushed flat.",
    ],
  },
  {
    issueType: "quantity",
    productId: mockId(2),
    packId: mockId(14),
    regionId: mockId(31),
    productName: "Northline Oats",
    packLabel: "6 ct box",
    regionName: "Pacific Northwest",
    idStart: 701,
    detectedDaysAgo: 1,
    lines: [
      "The 6 count box had five pouches. The empty slot still had glue on it.",
      "Seattle club pack was light. I counted five pouches, not six.",
      "Same short count on a second box from the Portland warehouse aisle.",
      "The box weight felt wrong. One pouch was missing and the flap was already glued.",
    ],
  },
  {
    issueType: "other",
    productId: mockId(3),
    packId: mockId(16),
    regionId: mockId(33),
    productName: "Cedar Brew",
    packLabel: "8 oz cold brew bottle",
    regionName: "Midwest",
    idStart: 801,
    detectedDaysAgo: 9,
    lines: [
      "The cold brew label lists a roast name that does not match the cap code.",
      "I cannot tell if this bottle is sweetened. The front panel and the cap disagree.",
      "Chicago shop. The bottle says original and the neck tag says vanilla.",
    ],
  },
];

const built = specs.map(build);

export const clusters: ClusterMeta[] = built.map((entry) => entry.meta);
export const verbatims: Verbatim[] = built.flatMap((entry) => entry.rows);
