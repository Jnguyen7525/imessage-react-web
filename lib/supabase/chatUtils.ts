import createClient from "@/lib/supabase/client";

export async function findOrCreateChat(
  contactId: string
): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("❌ Failed to get current user:", userError?.message);
    return null;
  }

  const { data: contactChats, error: contactError } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", contactId);

  if (contactError || !contactChats) {
    console.error("❌ Failed to get contact's chats:", contactError?.message);
    return null;
  }

  const chatIds = contactChats.map((row) => row.chat_id);

  const { data: sharedChats, error: sharedError } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", user.id)
    .in("chat_id", chatIds);

  if (sharedError) {
    console.error("❌ Failed to get shared chats:", sharedError.message);
    return null;
  }

  if (sharedChats && sharedChats.length > 0) {
    return sharedChats[0].chat_id;
  }

  return await createOneToOneChat(user.id, contactId);
}

export async function createOneToOneChat(
  userId: string,
  contactId: string
): Promise<string | null> {
  const supabase = createClient();

  const { data: chatData, error: chatError } = await supabase
    .from("chats")
    .insert({})
    .select()
    .single();

  if (chatError || !chatData) {
    console.error("❌ Failed to create chat:", chatError?.message);
    return null;
  }

  const { error: participantError } = await supabase
    .from("chat_participants")
    .insert([
      { chat_id: chatData.id, user_id: userId },
      { chat_id: chatData.id, user_id: contactId },
    ]);

  if (participantError) {
    console.error("❌ Failed to add participants:", participantError.message);
    return null;
  }

  return chatData.id;
}
