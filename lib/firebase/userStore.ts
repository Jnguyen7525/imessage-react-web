// // Replace with actual Supabase or DB logic
// export async function getFCMTokenForUser(
//   userId: string
// ): Promise<string | null> {
//   // Query your DB for the user's FCM token
//   return "mock-fcm-token";
// }

import createClient from "../supabase/client";

// import { supabase } from "../supabase/client";

// export async function saveFCMTokenForUser(
//   userId: string,
//   token: string
// ): Promise<void> {
//   // Save the token to your DB
// }

export async function saveFCMTokenForUser(userId: string, token: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("fcm_tokens")
    .upsert({ user_id: userId, token });

  return { error };
}

export async function getFCMTokenForUser(
  userId: string
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data.token;
}
