import payload from "../../../data/routes.json";

import { parseAreas, parseRoutes, type Area, type Route } from "./matcher";

export const routes: Route[] = parseRoutes(payload);
export const areas: Area[] = parseAreas(payload);

export function areaByName(name: string): Area | undefined {
  const target = name.trim().toLowerCase();
  return areas.find((area) => area.name.toLowerCase() === target);
}
