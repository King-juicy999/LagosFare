import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, transportStyle } from "../constants/lagosfare";
import { fareDisplay, type TripOption } from "../lib/matcher";

interface TripOptionCardProps {
  option: TripOption;
  onShowOnMap: () => void;
  onOpenDirections: () => void;
}

export function TripOptionCard({
  option,
  onShowOnMap,
  onOpenDirections,
}: TripOptionCardProps) {
  const isDirect = option.legs.length === 1;
  const transport = transportStyle(option.legs[0].route.transportType);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.fareBlock}>
          <Text style={styles.fare}>{fareDisplay(option.totalFare)}</Text>
          <Text style={styles.estimate}>estimated total</Text>
        </View>
        <View
          style={[styles.badge, { backgroundColor: transport.background }]}
        >
          <Text style={[styles.badgeText, { color: transport.ink }]}>
            {transport.label}
          </Text>
        </View>
      </View>

      {isDirect ? (
        <View style={styles.directRow}>
          <Text style={styles.directName}>{option.legs[0].from}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.directName}>{option.legs[0].to}</Text>
        </View>
      ) : (
        <View style={styles.legs}>
          {option.legs.map((leg, index) => {
            const legTransport = transportStyle(leg.route.transportType);
            return (
              <View key={`${leg.from}-${leg.to}-${index}`} style={styles.leg}>
                <Text style={styles.legCount}>Leg {index + 1}</Text>
                <View style={styles.legRow}>
                  <Text style={styles.legName}>{leg.from}</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.legName}>{leg.to}</Text>
                </View>
                <Text style={styles.legDetail}>
                  {legTransport.label} · {fareDisplay(leg.route.fareNaira)}
                </Text>
                {leg.route.notes ? (
                  <Text style={styles.notes}>{leg.route.notes}</Text>
                ) : null}
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{fareDisplay(option.totalFare)}</Text>
          </View>
        </View>
      )}

      {isDirect && option.legs[0].route.notes ? (
        <Text style={styles.notes}>{option.legs[0].route.notes}</Text>
      ) : null}

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={onOpenDirections}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>Open in Google Maps</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={onShowOnMap}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Show boarding point</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  fareBlock: {
    flex: 1,
  },
  fare: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    color: COLORS.ink,
    letterSpacing: -1,
  },
  estimate: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.inkFaint,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  directRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    flexWrap: "wrap",
  },
  directName: {
    fontSize: 15,
    color: COLORS.ink,
    fontWeight: "600",
  },
  arrow: {
    marginHorizontal: 8,
    fontSize: 15,
    color: COLORS.inkFaint,
  },
  legs: {
    marginTop: 14,
  },
  leg: {
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  legCount: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: COLORS.inkFaint,
    marginBottom: 4,
  },
  legRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  legName: {
    fontSize: 15,
    color: COLORS.ink,
    fontWeight: "600",
  },
  legDetail: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.inkSoft,
  },
  notes: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkSoft,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.inkSoft,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.ink,
  },
  buttons: {
    marginTop: 16,
    flexDirection: "row",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.brand,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: COLORS.brandSoft,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: COLORS.brand,
    fontSize: 14,
    fontWeight: "600",
  },
});
