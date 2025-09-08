"use client";

import { useCallStore } from "@/store/useCallStore";
import { useRouter, useSearchParams } from "next/navigation";

import { IncomingCallPopup } from "./IncomingCall";
import { OutgoingCallStatus } from "./OutgoingCall";
import { useCallSignaling } from "@/hooks/useCallSignaling";

export default function CallUIOverlay() {
  useCallSignaling(); // ✅ This runs all the signaling logic

  const incomingCall = useCallStore((s) => s.incomingCall);
  const outgoingCall = useCallStore((s) => s.outgoingCall);
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  if (incomingCall) {
    return (
      <IncomingCallPopup
        callerName={incomingCall.callerName}
        callerAvatar={incomingCall.callerAvatar}
        onAccept={async () => {
          const res = await fetch(
            `/api/connection-details?roomName=${incomingCall.roomName}&participantName=${participantName}`
          );
          const data = await res.json();
          // Notify caller that callee accepted

          //   localStorage.setItem("callAccepted", incomingCall.roomName);
          // ✅ Scoped signal to caller

          localStorage.setItem(
            `callAccepted-${incomingCall.callerName}`,
            incomingCall.roomName
          );

          // router.push(
          //   `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${incomingCall.roomName}`
          // );
          router.push(
            `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${incomingCall.roomName}&user=${participantName}`
          );
          clearIncomingCall();
        }}
        onReject={() => {
          localStorage.setItem("callDeclined", incomingCall.roomName); // 👈 signal rejection

          clearIncomingCall();
        }}
      />
    );
  }

  if (outgoingCall) {
    return (
      <OutgoingCallStatus
        calleeName={outgoingCall.calleeName}
        calleeAvatar={outgoingCall.calleeAvatar}
      />
    );
  }

  return null;
}
