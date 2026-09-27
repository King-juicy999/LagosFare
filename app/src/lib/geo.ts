import { areas } from "./data";
import type { Area } from "./matcher";

export interface NearestMatch {
  area: Area;
  distanceKm: number;
}

export const MAX_MATCH_KM = 12;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): number {
  const dLat = toRadians(toLat - fromLat);
  const dLon = toRadians(toLon - fromLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat));
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function nearestArea(latitude: number, longitude: number): NearestMatch | null {
  let best: NearestMatch | null = null;

  for (const area of areas) {
    const distanceKm = haversineKm(latitude, longitude, area.latitude, area.longitude);
    if (!best || distanceKm < best.distanceKm) {
      best = { area, distanceKm };
    }
  }

  if (!best || best.distanceKm > MAX_MATCH_KM) return null;
  return best;
}

export const LAGOS_CENTER = {
  latitude: 6.5244,
  longitude: 3.3792,
};

export const LAGOS_SPAN = {
  latitudeDelta: 0.34,
  longitudeDelta: 0.34,
};
