import * as Location from "expo-location";
import { Platform } from "react-native";

import { nearestArea, type NearestMatch } from "./geo";

export type LocationOutcome =
  | { status: "matched"; match: NearestMatch }
  | { status: "unavailable" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "outOfRange"; nearest: NearestMatch | null };

export async function resolveCurrentArea(): Promise<LocationOutcome> {
  if (Platform.OS === "web") {
    return { status: "unsupported" };
  }

  const services = await Location.hasServicesEnabledAsync();
  if (!services) {
    return { status: "unavailable" };
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    return { status: "denied" };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  const match = nearestArea(latitude, longitude);
  if (!match) {
    return { status: "outOfRange", nearest: null };
  }

  return { status: "matched", match };
}

export async function watchCurrentArea(
  onArea: (match: NearestMatch) => void,
): Promise<() => void> {
  const subscription = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, distanceInterval: 25, timeInterval: 10000 },
    (position) => {
      const match = nearestArea(position.coords.latitude, position.coords.longitude);
      if (match) onArea(match);
    },
  );

  return () => subscription.remove();
}
