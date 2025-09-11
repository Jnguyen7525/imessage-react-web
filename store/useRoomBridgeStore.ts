// store/useRoomBridgeStore.ts
import { create } from "zustand";
import type { Room } from "livekit-client";

export const useRoomBridgeStore = create<{
  room: Room | null;
  setRoom: (room: Room | null) => void;
}>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
}));
