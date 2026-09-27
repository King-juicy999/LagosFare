import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { COLORS } from "../constants/lagosfare";
import { hasSeenWelcome } from "../lib/first-run";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    let alive = true;

    hasSeenWelcome()
      .then((value) => {
        if (!alive) return;
        setSeen(value);
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;
        setSeen(true);
        setReady(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={COLORS.brand} size="small" />
      </View>
    );
  }

  if (!seen) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(tabs)/plan" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
});
