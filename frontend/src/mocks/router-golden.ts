import type { RouteDecision } from "@/lib/types.generated";
import golden from "../../../data/golden/router_labeled_queries.json";

export type RouterGoldenQuery = {
  query: string;
  entityCount: number;
  taxonomyCoverage: number;
  expectedRoute: RouteDecision;
  predictedRoute: RouteDecision;
};

export const routerGoldenQueries = golden as RouterGoldenQuery[];
