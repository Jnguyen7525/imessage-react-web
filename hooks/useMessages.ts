// import { useEffect, useState } from "react";
// import createClient from "@/lib/supabase/client";

// export type MessageType = {
//   id: string;
//   sender_id: string;
//   chat_id: string;
//   content: string;
//   created_at: string;
//   avatar_url?: string;
//   status?: "sent" | "delivered" | "read";
//   delivered_at?: string;
//   read_at?: string;
// };

// export function useMessages(
//   chat_id: string | undefined,
//   user_id: string | undefined
// ) {
//   const [messages, setMessages] = useState<MessageType[]>([]);
//   const [messagesLoading, setMessagesLoading] = useState(false);

//   useEffect(() => {
//     if (!chat_id || !user_id) return;

//     const fetchMessages = async () => {
//       setMessagesLoading(true);
//       const supabase = createClient();
//       const { data, error } = await supabase
//         .from("messages")
//         .select("*")
//         .eq("chat_id", chat_id)
//         .order("created_at", { ascending: true });

//       if (error) {
//         console.error("❌ Error fetching messages:", error.message);
//         setMessagesLoading(false);
//         return;
//       }

//       setMessages(data);
//       setMessagesLoading(false);
//     };

//     fetchMessages();
//   }, [chat_id, user_id]);

//   return { messages, setMessages, messagesLoading };
// }

import { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";

export type MessageType = {
  id: string;
  sender_id: string;
  chat_id: string;
  content: string;
  created_at: string;
  avatar_url?: string;
  status?: "sent" | "delivered" | "read";
  delivered_at?: string;
  read_at?: string;
};

export function useMessages(
  chat_id: string | undefined,
  user_id: string | undefined
) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch messages
  useEffect(() => {
    if (!chat_id || !user_id) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chat_id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching messages:", error.message);
        setMessagesLoading(false);
        return;
      }

      setMessages(data);
      setMessagesLoading(false);
    };

    fetchMessages();
  }, [chat_id, user_id]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (!chat_id || !user_id) return;

    const markAsRead = async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("messages")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("chat_id", chat_id)
        .neq("sender_id", user_id)
        .is("read_at", null);

      if (error) {
        console.error("❌ Failed to mark as read:", error.message);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.chat_id === chat_id && m.sender_id !== user_id && !m.read_at
            ? { ...m, status: "read", read_at: new Date().toISOString() }
            : m
        )
      );
    };

    markAsRead();
  }, [chat_id, user_id]);

  // Mark incoming messages as read while viewing
  useEffect(() => {
    if (!chat_id || !user_id || messages.length === 0) return;

    const unread = messages.some(
      (m) => m.chat_id === chat_id && m.sender_id !== user_id && !m.read_at
    );

    if (!unread) return;

    const markIncomingAsRead = async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("messages")
        .update({ status: "read", read_at: new Date().toISOString() })
        .eq("chat_id", chat_id)
        .neq("sender_id", user_id)
        .is("read_at", null);

      if (error) {
        console.error("❌ Failed to mark incoming as read:", error.message);
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.chat_id === chat_id &&
          m.sender_id !== user_id &&
          m.delivered_at &&
          !m.read_at
            ? { ...m, status: "read", read_at: new Date().toISOString() }
            : m
        )
      );
    };

    markIncomingAsRead();
  }, [messages, chat_id, user_id]);

  return { messages, setMessages, messagesLoading };
}
