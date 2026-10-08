import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebase";

const storageKey = () =>
  `learnbridge.missions.${auth?.currentUser?.uid ?? "guest"}`;

export async function getCompletedMissions(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey());
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function markMissionComplete(id: string) {
  const done = await getCompletedMissions();
  if (done.includes(id)) return;
  await AsyncStorage.setItem(storageKey(), JSON.stringify([...done, id]));
}