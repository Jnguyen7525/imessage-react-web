import { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";

export function useTypingStatus(
  chat_id: string | undefined,
  user_id: string | undefined
) {
  const [typingIndicator, setTypingIndicator] = useState(false);

  useEffect(() => {
    if (!chat_id || !user_id) return;

    const supabase = createClient();

    const channel = supabase
      .channel("typing_status")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "typing_status" },
        (payload) => {
          const { chat_id: cid, user_id: uid, is_typing } = payload.new;
          if (cid === chat_id && uid !== user_id) setTypingIndicator(is_typing);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "typing_status" },
        (payload) => {
          const { chat_id: cid, user_id: uid, is_typing } = payload.new;
          if (cid === chat_id && uid !== user_id) setTypingIndicator(is_typing);
        }
      )
      .subscribe(); // ✅ No .then() needed

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat_id, user_id]);

  const updateTypingStatus = async (message: string) => {
    if (!chat_id || !user_id) return;
    const supabase = createClient();
    const isTyping = message.trim().length > 0;

    await supabase.from("typing_status").upsert({
      chat_id,
      user_id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });
  };

  return { typingIndicator, updateTypingStatus };
}
