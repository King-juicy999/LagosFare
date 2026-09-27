export interface Route {
  origin: string;
  destination: string;
  transportType: string;
  fareNaira: number;
  notes: string;
}

export interface Area {
  name: string;
  latitude: number;
  longitude: number;
}

export interface TripLeg {
  route: Route;
  from: string;
  to: string;
}

export interface TripOption {
  legs: TripLeg[];
  totalFare: number;
}

export const MATCH_CUTOFF = 0.72;
const SUGGEST_CUTOFF = 0.4;

export function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export function fareDisplay(fareNaira: number): string {
  return `N${fareNaira.toLocaleString("en-NG")}`;
}

export function parseRoutes(payload: unknown): Route[] {
  const entries = (payload as { routes?: unknown })?.routes;
  if (!Array.isArray(entries)) return [];

  const routes: Route[] = [];
  for (const raw of entries) {
    const entry = raw as Record<string, unknown>;
    const fare = Number(entry.fare_naira);
    if (typeof entry.origin !== "string") continue;
    if (typeof entry.destination !== "string") continue;
    if (typeof entry.transport_type !== "string") continue;
    if (!Number.isFinite(fare)) continue;

    routes.push({
      origin: entry.origin.trim(),
      destination: entry.destination.trim(),
      transportType: entry.transport_type.trim().toLowerCase(),
      fareNaira: fare,
      notes: typeof entry.notes === "string" ? entry.notes.trim() : "",
    });
  }

  return routes;
}

export function parseAreas(payload: unknown): Area[] {
  const entries = (payload as { areas?: unknown })?.areas;
  if (!Array.isArray(entries)) return [];

  const areas: Area[] = [];
  for (const raw of entries) {
    const entry = raw as Record<string, unknown>;
    if (typeof entry.name !== "string") continue;
    if (!Array.isArray(entry.coordinates) || entry.coordinates.length !== 2) continue;

    const latitude = Number(entry.coordinates[0]);
    const longitude = Number(entry.coordinates[1]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    areas.push({ name: entry.name.trim(), latitude, longitude });
  }

  return areas;
}

function ratio(a: string, b: string): number {
  if (a === b) return 1;

  const aLength = a.length;
  const bLength = b.length;
  if (aLength === 0 || bLength === 0) return 0;

  let previous = new Array<number>(bLength + 1);
  for (let j = 0; j <= bLength; j += 1) {
    previous[j] = j;
  }

  for (let i = 1; i <= aLength; i += 1) {
    const current = new Array<number>(bLength + 1);
    current[0] = i;

    for (let j = 1; j <= bLength; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const substitution = previous[j - 1] + cost;
      const insertion = previous[j] + 1;
      const deletion = current[j - 1] + 1;
      current[j] = Math.min(substitution, insertion, deletion);
    }

    previous = current;
  }

  const total = aLength + bLength;
  const similarity = (total - previous[bLength]) / total;
  return similarity > 1 ? 1 : similarity < 0 ? 0 : similarity;
}

export function findLocation(query: string, locations: string[]): string | null {
  const target = normalize(query);
  if (!target) return null;

  const lookup = new Map<string, string>();
  for (const name of locations) {
    lookup.set(normalize(name), name);
  }

  const exact = lookup.get(target);
  if (exact !== undefined) return exact;

  let bestName: string | null = null;
  let bestScore = MATCH_CUTOFF;
  for (const [key, name] of lookup) {
    const score = ratio(target, key);
    if (score > bestScore) {
      bestScore = score;
      bestName = name;
    }
  }

  return bestName;
}

export function suggestLocations(query: string, locations: string[], limit = 3): string[] {
  const target = normalize(query);
  const scored: Array<{ name: string; score: number }> = [];

  for (const name of locations) {
    const score = ratio(target, normalize(name));
    if (score >= SUGGEST_CUTOFF) scored.push({ name, score });
  }

  scored.sort((left, right) => right.score - left.score);
  return scored.slice(0, limit).map((entry) => entry.name);
}

export function knownLocations(allRoutes: Route[]): string[] {
  const places = new Set<string>();
  for (const route of allRoutes) {
    places.add(route.origin);
    places.add(route.destination);
  }
  return [...places].sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()));
}

function pairKey(a: string, b: string): string {
  const first = normalize(a);
  const second = normalize(b);
  return first < second ? `${first}|${second}` : `${second}|${first}`;
}

function findDirect(allRoutes: Route[], origin: string, destination: string): Route[] {
  const wanted = pairKey(origin, destination);

  const found: Route[] = [];
  const seen = new Set<string>();

  for (const route of allRoutes) {
    if (pairKey(route.origin, route.destination) !== wanted) continue;

    const key = `${route.transportType}|${route.fareNaira}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(route);
  }

  return found.sort((left, right) => left.fareNaira - right.fareNaira);
}

function neighbours(allRoutes: Route[]): Map<string, Array<{ place: string; route: Route }>> {
  const links = new Map<string, Array<{ place: string; route: Route }>>();

  for (const route of allRoutes) {
    const from = normalize(route.origin);
    const to = normalize(route.destination);

    const outward = links.get(from);
    if (outward) outward.push({ place: to, route });
    else links.set(from, [{ place: to, route }]);

    const inward = links.get(to);
    if (inward) inward.push({ place: from, route });
    else links.set(to, [{ place: from, route }]);
  }

  return links;
}

function findChained(
  allRoutes: Route[],
  origin: string,
  destination: string,
): TripOption[] {
  const links = neighbours(allRoutes);
  const start = normalize(origin);
  const end = normalize(destination);

  const options: TripOption[] = [];
  const seenKeys = new Set<string>();

  const isChained = origin.trim().toLowerCase() !== destination.trim().toLowerCase();

  const walk = (place: string, legs: TripLeg[], visited: Set<string>) => {
    if (legs.length > 2) return;

    if (place === end && legs.length > 0) {
      if (!isChained && legs.length > 1) return;

      const key = legs
        .map((leg) => `${normalize(leg.from)}>${normalize(leg.to)}>${leg.route.fareNaira}`)
        .join("|");
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      options.push({
        legs,
        totalFare: legs.reduce((sum, leg) => sum + leg.route.fareNaira, 0),
      });
      return;
    }

    const onward = links.get(place);
    if (!onward) return;

    for (const link of onward) {
      if (visited.has(link.place)) continue;
      const route = link.route;
      const forward = normalize(route.origin) === place;
      const leg: TripLeg = {
        route,
        from: forward ? route.origin : route.destination,
        to: forward ? route.destination : route.origin,
      };
      const nextVisited = new Set(visited);
      nextVisited.add(link.place);
      nextVisited.add(place);
      walk(link.place, [...legs, leg], nextVisited);
    }
  };

  walk(start, [], new Set([start]));

  options.sort((left, right) => left.totalFare - right.totalFare);
  return options;
}

export function findTripOptions(
  origin: string,
  destination: string,
  allRoutes: Route[],
): TripOption[] {
  const direct = findDirect(allRoutes, origin, destination).map((route) => ({
    legs: [{ route, from: route.origin, to: route.destination }],
    totalFare: route.fareNaira,
  }));

  if (normalize(origin) === normalize(destination)) return direct;

  const chained = findChained(allRoutes, origin, destination).filter(
    (option) => option.legs.length > 1,
  );
  return [...direct, ...chained];
}

export function connectionsFor(place: string, allRoutes: Route[]): Route[] {
  const target = normalize(place);
  return allRoutes.filter(
    (route) => normalize(route.origin) === target || normalize(route.destination) === target,
  );
}
