import { MaterialSymbols_500Medium, useFonts } from "@expo-google-fonts/material-symbols";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { COLORS } from "../constants/lagosfare";
import { MapFocusContext, type MapFocusTarget } from "../lib/map-focus";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    MaterialSymbols_500Medium,
  });
  const [mapFocus, setMapFocus] = useState<MapFocusTarget | null>(null);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const focusOnMap = useCallback((origin: string, destination: string) => {
    setMapFocus((current) => ({
      origin,
      destination,
      nonce: (current?.nonce ?? 0) + 1,
    }));
  }, []);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: COLORS.brand }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MapFocusContext.Provider value={{ focus: mapFocus, focusOnMap }}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" />
          </Stack>
        </MapFocusContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
