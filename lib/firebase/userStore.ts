import createClient from "../supabase/client";

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
