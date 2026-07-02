import AsyncStorage from "@react-native-async-storage/async-storage";

const VISITED_KEY = "tour.visited.v1";
const DEVICE_KEY = "tour.deviceId.v1";

export async function getVisited(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(VISITED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export async function markVisited(stopId: string): Promise<Set<string>> {
  const visited = await getVisited();
  visited.add(stopId);
  await AsyncStorage.setItem(VISITED_KEY, JSON.stringify([...visited]));
  return visited;
}

export async function resetVisited(): Promise<void> {
  await AsyncStorage.removeItem(VISITED_KEY);
}

/** Stable anonymous id for optional Supabase sync — no account needed. */
export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    await AsyncStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
