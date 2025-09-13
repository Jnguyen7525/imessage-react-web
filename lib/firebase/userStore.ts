// // Replace with actual Supabase or DB logic
// export async function getFCMTokenForUser(
//   userId: string
// ): Promise<string | null> {
//   // Query your DB for the user's FCM token
//   return "mock-fcm-token";
// }

import { supabase } from "../supabase/supabase";

// export async function saveFCMTokenForUser(
//   userId: string,
//   token: string
// ): Promise<void> {
//   // Save the token to your DB
// }

export async function saveFCMTokenForUser(userId: string, token: string) {
  await supabase.from("fcm_tokens").upsert({ user_id: userId, token });
}

export async function getFCMTokenForUser(
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data.token;
}
