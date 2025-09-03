// store/useCallStore.ts
import { create } from "zustand";

type CallState = {
  incomingCall: null | {
    callerName: string;
    callerAvatar: string;
    roomName: string;
    liveKitUrl: string;
  };

  outgoingCall: null | {
    calleeName: string;
    calleeAvatar: string;
    roomName: string;
    liveKitUrl: string;
    callerToken: string;
    callerName: string; // ✅ Add this line
  };

  setIncomingCall: (data: CallState["incomingCall"]) => void;
  clearIncomingCall: () => void;
  setOutgoingCall: (data: CallState["outgoingCall"]) => void;
  clearOutgoingCall: () => void;
};

export const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  outgoingCall: null,
  setIncomingCall: (data) => set({ incomingCall: data }),
  clearIncomingCall: () => set({ incomingCall: null }),
  setOutgoingCall: (data) => set({ outgoingCall: data }),
  clearOutgoingCall: () => set({ outgoingCall: null }),
}));
