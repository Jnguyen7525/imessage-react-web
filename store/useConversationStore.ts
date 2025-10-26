import { create } from "zustand";
// import { ImageSourcePropType } from 'react-native';

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
  // avatar: ImageSourcePropType;
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
  selectedConversation: Contact | undefined;
  setSelectedConversation: (conv: Contact | undefined) => void;

  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
};

type PhoneState = {
  showPhone: boolean;
  setShowPhone: (visible: boolean) => void;
};

// export const useConversationStore = create<ConversationState>((set) => ({
//   selectedConversation: undefined,
//   setSelectedConversation: (conv) => set({ selectedConversation: conv }),
// }));

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
