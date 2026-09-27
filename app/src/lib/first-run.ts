import Constants from "expo-constants";
import SQLiteStorage from "expo-sqlite/kv-store";

const WELCOME_SEEN_KEY = "lagosfare.welcomeSeen";

type KeyValueStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

function createStore(): KeyValueStore {
  if (Constants.appOwnership === "expo") {
    return SQLiteStorage;
  }

  return require("@react-native-async-storage/async-storage").default;
}

const store = createStore();

export async function hasSeenWelcome(): Promise<boolean> {
  return (await store.getItem(WELCOME_SEEN_KEY)) === "true";
}

export async function markWelcomeSeen(): Promise<void> {
  await store.setItem(WELCOME_SEEN_KEY, "true");
}
