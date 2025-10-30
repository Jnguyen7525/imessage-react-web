import { useEffect } from "react";
import createClient from "@/lib/supabase/client";
import { ChatContext } from "@/store/useConversationStore";

export function useContacts(setContacts: (contacts: ChatContext[]) => void) {
  useEffect(() => {
    const fetchContacts = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: users, error: queryError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .neq("id", user.id);

      if (queryError || !users) return;

      const formatted: ChatContext[] = await Promise.all(
        users.map(async (u) => {
          const { data: contactChats } = await supabase
            .from("chat_participants")
            .select("chat_id")
            .eq("user_id", u.id);

          const chatIds = contactChats?.map((row) => row.chat_id) ?? [];

          const { data: sharedChats } = await supabase
            .from("chat_participants")
            .select("chat_id")
            .eq("user_id", user.id)
            .in("chat_id", chatIds);

          const chat_id = sharedChats?.[0]?.chat_id ?? "";

          return {
            contact: {
              id: u.id,
              name: u.name,
              avatar: u.avatar_url ?? "",
            },
            chat_id,
          };
        })
      );

      setContacts(formatted);
    };

    fetchContacts();
  }, [setContacts]);
}
