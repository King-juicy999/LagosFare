import AsyncStorage from "@react-native-async-storage/async-storage";

const WELCOME_SEEN_KEY = "lagosfare.welcomeSeen";

export async function hasSeenWelcome(): Promise<boolean> {
  return (await AsyncStorage.getItem(WELCOME_SEEN_KEY)) === "true";
}

export async function markWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
}
