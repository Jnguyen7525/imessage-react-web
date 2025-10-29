import { create } from "zustand";
// import { ImageSourcePropType } from 'react-native';

export type ChatContext = {
  contact: Contact;
  chat_id: string;
};

type Contact = {
  id: string;
  name: string;
  avatar: string;
};

type Conversation = {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: string;
};

type ConversationUIState = {
  showOptions: boolean;
  setShowOptions: (visible: boolean) => void;
  toggleShowOptions: () => void;
};

type ConversationState = {
  // selectedConversation: Conversation | undefined;
  // setSelectedConversation: (conv: Conversation | undefined) => void;
  selectedConversation: ChatContext | undefined;
  setSelectedConversation: (conv: ChatContext | undefined) => void;

  // selectedConversation: Contact | undefined;
  // setSelectedConversation: (conv: Contact | undefined) => void;

  // contacts: Contact[];
  // setContacts: (contacts: Contact[]) => void;
  contacts: ChatContext[];
  setContacts: (contacts: ChatContext[]) => void;
};

type PhoneState = {
  showPhone: boolean;
  setShowPhone: (visible: boolean) => void;
};

export const useConversationStore = create<
  ConversationState & ConversationUIState & PhoneState
>((set) => ({
  selectedConversation: undefined,
  setSelectedConversation: (conv) => set({ selectedConversation: conv }),
  showOptions: false,
  setShowOptions: (visible) => set({ showOptions: visible }),
  toggleShowOptions: () =>
    set((state) => ({ showOptions: !state.showOptions })),
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  showPhone: false,
  setShowPhone: (visible) => set({ showPhone: visible }),
}));
