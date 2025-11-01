import { findOrCreateChat } from "@/lib/supabase/chatUtils";
import { ChatContext } from "@/store/useConversationStore";

export function useChatManager(
  setSelectedConversation: (c: ChatContext | undefined) => void,
  setUnreadCounts: (fn: any) => void
) {
  const handleSelectContact = async (contact: {
    id: string;
    name: string;
    avatar?: string; // ← make it optional
  }) => {
    const chat_id = await findOrCreateChat(contact.id);
    if (!chat_id) return;

    setSelectedConversation({ contact, chat_id });
    setUnreadCounts((prev: any) => ({ ...prev, [chat_id]: 0 }));
  };

  return { handleSelectContact };
}
