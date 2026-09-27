import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, TRANSPORT } from "../constants/lagosfare";
import { markWelcomeSeen } from "../lib/first-run";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

const HIGHLIGHTS = [
  { label: "Danfo", detail: "Yellow bus", color: TRANSPORT.danfo.background },
  { label: "BRT", detail: "Bus rapid transit", color: TRANSPORT.brt.background },
  { label: "Keke", detail: "Motor tricycle", color: TRANSPORT.keke.background },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 620,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const enter = (index: number) => ({
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
    delay: 90 + index * 80,
  });

  const onPressIn = () => {
    Animated.spring(press, {
      toValue: 1,
      stiffness: 320,
      damping: 30,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(press, {
      toValue: 0,
      stiffness: 320,
      damping: 30,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  };

  const start = async () => {
    await markWelcomeSeen();
    router.replace("/(tabs)/plan");
  };

  const pressScale = press.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97],
  });

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Animated.View style={[styles.markRow, enter(0)]}>
        <View style={styles.mark}>
          <View style={styles.nodeTop} />
          <View style={styles.track} />
          <View style={styles.nodeBottom} />
        </View>
        <Text style={styles.wordmark}>LagosFare</Text>
      </Animated.View>

      <View style={styles.body}>
        <Animated.Text style={[styles.heading, enter(1)]}>
          Know the fare before you board.
        </Animated.Text>
        <Animated.Text style={[styles.bodyCopy, enter(2)]}>
          LagosFare gives you the danfo, BRT and keke options between any two
          Lagos areas, with an estimate you can check against the driver.
        </Animated.Text>

        <Animated.View style={[styles.list, enter(3)]}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.label} style={styles.listRow}>
              <View style={[styles.swatch, { backgroundColor: item.color }]} />
              <Text style={styles.listLabel}>{item.label}</Text>
              <Text style={styles.listDetail}>{item.detail}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, enter(4)]}>
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <Pressable
            onPress={start}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            accessibilityRole="button"
            accessibilityLabel="Get started"
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get started</Text>
          </Pressable>
        </Animated.View>
        <Text style={styles.finePrint}>
          Fares are estimates. Drivers set the real amount at the stop.
        </Text>
        <Pressable
          onPress={start}
          accessibilityRole="button"
          style={styles.skip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.brand,
    paddingHorizontal: 24,
  },
  markRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  wordmark: {
    marginLeft: 14,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: COLORS.surface,
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeTop: {
    position: "absolute",
    top: 22,
    left: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
  },
  track: {
    position: "absolute",
    top: 33,
    left: 30,
    width: 2,
    height: 18,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  nodeBottom: {
    position: "absolute",
    top: 48,
    left: 24,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: COLORS.surface,
  },
  bodyCopy: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255, 255, 255, 0.72)",
  },
  list: {
    marginTop: 28,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  listLabel: {
    width: 62,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.surface,
  },
  listDetail: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.60)",
  },
  footer: {
    paddingBottom: 4,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.brand,
    letterSpacing: -0.2,
  },
  finePrint: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.72)",
  },
  skip: {
    marginTop: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.72)",
  },
});
