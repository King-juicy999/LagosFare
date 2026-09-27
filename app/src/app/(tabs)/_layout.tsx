import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../../constants/lagosfare";

function TabGlyph({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={styles.glyphWrap}>
      <Text
        style={[
          styles.glyph,
          { color: focused ? COLORS.brand : COLORS.inkFaint },
        ]}
      >
        {name}
      </Text>
      {!focused ? <View style={styles.glyphDot} /> : null}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.inkFaint,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        sceneStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan a trip",
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused ? styles.labelActive : null]}>
              {focused ? "Plan a trip" : ""}
            </Text>
          ),
          tabBarIcon: ({ focused }) => <TabGlyph name="route" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.label, focused ? styles.labelActive : null]}>
              {focused ? "Map" : ""}
            </Text>
          ),
          tabBarIcon: ({ focused }) => <TabGlyph name="map" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingTop: 6,
  },
  item: {
    gap: 2,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  labelActive: {
    color: COLORS.brand,
    fontWeight: "600",
  },
  glyphWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    fontFamily: "MaterialSymbols_500Medium",
    fontSize: 22,
  },
  glyphDot: {
    marginTop: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.inkFaint,
  },
});
