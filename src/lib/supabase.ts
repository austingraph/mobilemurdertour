import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";
import { getDeviceId } from "./storage";

/**
 * Supabase is strictly optional: with no env vars set, `supabase` is null and
 * every helper below quietly no-ops, so the tour works fully offline.
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

/** Record that this device reached a stop (fire-and-forget analytics). */
export async function logVisit(stopId: string): Promise<void> {
  if (!supabase) return;
  try {
    const deviceId = await getDeviceId();
    await supabase.from("visits").insert({ device_id: deviceId, stop_id: stopId });
  } catch {
    // Offline or misconfigured — never let sync break the tour.
  }
}

/** Send user feedback / ghost sighting reports to the `feedback` table. */
export async function submitFeedback(
  stopId: string | null,
  message: string,
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const deviceId = await getDeviceId();
    const { error } = await supabase
      .from("feedback")
      .insert({ device_id: deviceId, stop_id: stopId, message });
    return !error;
  } catch {
    return false;
  }
}
