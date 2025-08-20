import { create } from 'zustand';
import { ImageSourcePropType } from 'react-native';

type Conversation = {
  id: string;
  name: string;
  message: string;
  time: string;
  avatar: ImageSourcePropType;
};

type ConversationUIState = {
  showOptions: boolean;
  setShowOptions: (visible: boolean) => void;
  toggleShowOptions: () => void;
};

type ConversationState = {
  selectedConversation: Conversation | undefined;
  setSelectedConversation: (conv: Conversation | undefined) => void;
};

// export const useConversationStore = create<ConversationState>((set) => ({
//   selectedConversation: undefined,
//   setSelectedConversation: (conv) => set({ selectedConversation: conv }),
// }));

export const useConversationStore = create<ConversationState & ConversationUIState>((set) => ({
  selectedConversation: undefined,
  setSelectedConversation: (conv) => set({ selectedConversation: conv }),
  showOptions: false,
  setShowOptions: (visible) => set({ showOptions: visible }),
  toggleShowOptions: () => set((state) => ({ showOptions: !state.showOptions })),
}));
