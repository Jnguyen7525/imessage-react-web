import { useEffect } from "react";
import createClient from "@/lib/supabase/client";
import { MessageType } from "./useMessages";

export function useRealtimeChat({
  userId,
  selectedChatId,
  setMessages,
  setUnreadCounts,
}: {
  userId: string | undefined;
  selectedChatId: string | undefined;
  setMessages: (fn: (prev: MessageType[]) => MessageType[]) => void;
  setUnreadCounts: (
    fn: (prev: Record<string, number>) => Record<string, number>
  ) => void;
}) {
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const message = payload.new;

          const { data: isParticipantData } = await supabase
            .from("chat_participants")
            .select("chat_id")
            .eq("chat_id", message.chat_id)
            .eq("user_id", userId);

          if (!isParticipantData || isParticipantData.length === 0) return;

          const transformed: MessageType = {
            id: message.id,
            chat_id: message.chat_id,
            sender_id: message.sender_id,
            content: message.content,
            created_at: message.created_at,
            avatar_url: message.avatar_url ?? "",
            status: message.status,
            delivered_at: message.delivered_at,
            read_at: message.read_at,
          };

          if (message.chat_id === selectedChatId) {
            setMessages((prev) =>
              prev.some((m) => m.id === message.id)
                ? prev
                : [...prev, transformed]
            );
          }

          if (message.sender_id !== userId && !message.delivered_at) {
            setTimeout(async () => {
              const { data: current } = await supabase
                .from("messages")
                .select("status, delivered_at, read_at")
                .eq("id", message.id)
                .single();

              if (current?.status === "read" || current?.read_at) return;

              await supabase
                .from("messages")
                .update({
                  status: "delivered",
                  delivered_at: new Date().toISOString(),
                })
                .eq("id", message.id)
                .is("delivered_at", null);
            }, 500);
          }

          if (
            message.sender_id !== userId &&
            !message.read_at &&
            message.chat_id !== selectedChatId
          ) {
            setUnreadCounts((prev) => ({
              ...prev,
              [message.chat_id]: (prev[message.chat_id] || 0) + 1,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, selectedChatId]);
}
