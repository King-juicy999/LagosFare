import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, LAGOS_LABEL, MAP_PINS } from "../../constants/lagosfare";
import { areaByName, areas } from "../../lib/data";
import { LAGOS_CENTER, LAGOS_SPAN } from "../../lib/geo";
import { useMapFocus } from "../../lib/map-focus";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const { focus } = useMapFocus();

  const [region, setRegion] = useState<Region>({
    ...LAGOS_CENTER,
    ...LAGOS_SPAN,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") {
      setLocating(false);
      return;
    }

    let cancelled = false;

    const start = async () => {
      const services = await Location.hasServicesEnabledAsync();
      if (!services) {
        if (!cancelled) setLocating(false);
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        if (!cancelled) setLocating(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (cancelled) return;

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(coords);
      setRegion({ ...coords, ...LAGOS_SPAN });
      setLocating(false);
    };

    start();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!focus) return;

    const from = areaByName(focus.origin);
    const to = areaByName(focus.destination);
    if (!from || !to) return;

    const next: Region = {
      latitude: (from.latitude + to.latitude) / 2,
      longitude: (from.longitude + to.longitude) / 2,
      latitudeDelta: Math.abs(from.latitude - to.latitude) * 1.9 + 0.06,
      longitudeDelta: Math.abs(from.longitude - to.longitude) * 1.9 + 0.06,
    };

    setRegion(next);
    mapRef.current?.animateToRegion(next, 600);
  }, [focus]);

  const highlighted = useMemo(
    () => ({
      origin: focus ? areaByName(focus.origin)?.name : undefined,
      destination: focus ? areaByName(focus.destination)?.name : undefined,
    }),
    [focus],
  );

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {areas.map((area) => {
          const isOrigin = highlighted.origin === area.name;
          const isDestination = highlighted.destination === area.name;
          const pinColor = isOrigin
            ? MAP_PINS.origin
            : isDestination
              ? MAP_PINS.destination
              : MAP_PINS.default;

          return (
            <Marker
              key={area.name}
              coordinate={{ latitude: area.latitude, longitude: area.longitude }}
              title={`${area.name} area centre`}
              description={LAGOS_LABEL}
              pinColor={pinColor}
              tracksViewChanges={false}
            />
          );
        })}

        {userLocation ? (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="#3E7CB1"
            tracksViewChanges={false}
          />
        ) : null}
      </MapView>

      <View style={[styles.banner, { top: insets.top + 12 }]} pointerEvents="none">
        <Text style={styles.bannerTitle}>{areas.length} area centres</Text>
        <Text style={styles.bannerText}>{LAGOS_LABEL}</Text>
      </View>

      {locating ? (
        <View style={styles.locating}>
          <ActivityIndicator color={COLORS.brand} size="small" />
          <Text style={styles.locatingText}>Finding your location…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  banner: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.ink,
  },
  bannerText: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.inkSoft,
  },
  locating: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locatingText: {
    fontSize: 12,
    color: COLORS.inkSoft,
  },
});
