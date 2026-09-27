import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlaceInput } from "../../components/place-input";
import { TripOptionCard } from "../../components/trip-option-card";
import { COLORS } from "../../constants/lagosfare";
import { routes } from "../../lib/data";
import { useMapFocus } from "../../lib/map-focus";
import {
  knownLocations,
  suggestLocations,
  findLocation,
  findTripOptions,
  type TripOption,
} from "../../lib/matcher";
import { resolveCurrentArea } from "../../lib/location";

type Field = "origin" | "destination" | null;

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { focusOnMap } = useMapFocus();

  const locations = useMemo(() => knownLocations(routes), []);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [activeField, setActiveField] = useState<Field>(null);
  const [options, setOptions] = useState<TripOption[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!origin.trim() && !destination.trim()) {
      setOptions(null);
      setNote(null);
      return;
    }

    const from = findLocation(origin, locations);
    const to = findLocation(destination, locations);
    if (!from || !to) {
      setOptions(null);
      setNote(null);
      return;
    }

    setOptions(findTripOptions(from, to, routes));
    setNote(null);
  }, [origin, destination, locations]);

  const originSuggestions = useMemo(
    () => (activeField === "origin" ? suggestLocations(origin, locations) : []),
    [activeField, origin, locations],
  );
  const destinationSuggestions = useMemo(
    () => (activeField === "destination" ? suggestLocations(destination, locations) : []),
    [activeField, destination, locations],
  );

  const detect = async () => {
    setLocating(true);
    setActiveField(null);

    const outcome = await resolveCurrentArea();
    setLocating(false);

    if (outcome.status === "matched") {
      setOrigin(outcome.match.area.name);
      setNote(`Filled from your location, nearest area centre is ${outcome.match.area.name}.`);
      return;
    }

    if (outcome.status === "outOfRange") {
      setNote("You seem to be outside Lagos. Type where you are travelling from.");
      return;
    }

    if (outcome.status === "denied") {
      setNote("Location permission was declined. Type where you are travelling from.");
      return;
    }

    if (outcome.status === "unavailable") {
      setNote("Location services are switched off. Type where you are travelling from.");
      return;
    }

    setNote("Location is not available here. Type where you are travelling from.");
  };

  const openDirections = (option: TripOption) => {
    const start = option.legs[0].from;
    const end = option.legs[option.legs.length - 1].to;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(start)}&destination=${encodeURIComponent(end)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>LAGOSFARE</Text>
      <Text style={styles.heading}>Where are you going?</Text>

      <View style={styles.form}>
        <PlaceInput
          label="From"
          value={origin}
          onChangeText={setOrigin}
          onFocus={() => setActiveField("origin")}
          suggestions={originSuggestions}
          onPickSuggestion={(value) => {
            setOrigin(value);
            setActiveField(null);
          }}
          action={{ glyph: locating ? "hourglass_top" : "my_location", onPress: detect }}
        />

        <View style={styles.gap} />

        <PlaceInput
          label="To"
          value={destination}
          onChangeText={setDestination}
          onFocus={() => setActiveField("destination")}
          suggestions={destinationSuggestions}
          onPickSuggestion={(value) => {
            setDestination(value);
            setActiveField(null);
          }}
        />
      </View>

      {locating ? (
        <View style={styles.locatingRow}>
          <ActivityIndicator color={COLORS.brand} size="small" />
          <Text style={styles.locatingText}>Finding your nearest area…</Text>
        </View>
      ) : null}

      {note ? <Text style={styles.note}>{note}</Text> : null}

      {options && options.length > 0 ? (
        <View style={styles.results}>
          <Text style={styles.resultsHeading}>
            {options.length} {options.length === 1 ? "option" : "options"}
          </Text>
          {options.map((option, index) => (
            <View key={`${index}-${option.totalFare}`} style={styles.cardWrap}>
              <TripOptionCard
                option={option}
                onOpenDirections={() => openDirections(option)}
                onShowOnMap={() =>
                  focusOnMap(option.legs[0].from, option.legs[option.legs.length - 1].to)
                }
              />
            </View>
          ))}
          <Text style={styles.disclaimer}>
            Every fare here is an estimate, not a set price. Agree the amount
            with the driver before you board, and expect it to move with
            traffic, fuel prices and the time of day.
          </Text>
        </View>
      ) : null}

      {options && options.length === 0 ? (
        <Text style={styles.empty}>
          No route found between those two areas yet. Try a nearby area name.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: COLORS.inkFaint,
  },
  heading: {
    marginTop: 6,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    color: COLORS.ink,
    letterSpacing: -0.6,
  },
  form: {
    marginTop: 22,
  },
  gap: {
    height: 12,
  },
  locatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  locatingText: {
    fontSize: 13,
    color: COLORS.inkSoft,
  },
  note: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSoft,
  },
  results: {
    marginTop: 24,
  },
  resultsHeading: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLORS.inkFaint,
    marginBottom: 10,
  },
  cardWrap: {
    marginBottom: 12,
  },
  disclaimer: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.inkFaint,
  },
  empty: {
    marginTop: 24,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.inkSoft,
  },
});
