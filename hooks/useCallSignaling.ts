// "use client";

// import { useEffect } from "react";
// import { useCallStore } from "@/store/useCallStore";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";

// export function useCallSignaling() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const participantName = searchParams.get("user") ?? "anonymous";

//   const setIncomingCall = useCallStore((s) => s.setIncomingCall);
//   const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);

//   const isInbox = pathname === "/";
//   const isRoom = pathname?.startsWith("/custom");

//   // ✅ Incoming call popup (callee side)
//   useEffect(() => {
//     if (!isInbox && !isRoom) return;

//     const checkIncomingCall = () => {
//       const callData = localStorage.getItem(`incomingCall-${participantName}`);
//       if (callData) {
//         // const { roomName, caller, liveKitUrl, callerAvatar } =
//         //   JSON.parse(callData);
//         const { roomName, caller, liveKitUrl, callerAvatar, audioOnly } =
//           JSON.parse(callData);

//         setIncomingCall({
//           callerName: caller,
//           callerAvatar,
//           roomName,
//           liveKitUrl,
//           audioOnly, // ✅ Add this
//         });

//         const audio = new Audio("/ringtone.mp3");
//         audio.loop = true;
//         audio.play();

//         setTimeout(() => {
//           clearIncomingCall();
//           audio.pause();
//         }, 30000);

//         localStorage.removeItem(`incomingCall-${participantName}`);
//       }
//     };

//     checkIncomingCall(); // ✅ run immediately
//     window.addEventListener("focus", checkIncomingCall);
//     return () => window.removeEventListener("focus", checkIncomingCall);
//   }, [participantName, setIncomingCall, clearIncomingCall, isInbox, isRoom]);

//   // ✅ Call accepted (caller side)
//   useEffect(() => {
//     if (!isInbox && !isRoom) return; // ✅ allow both inbox and room views

//     const checkCallAccepted = () => {
//       const acceptedRoom = localStorage.getItem(
//         `callAccepted-${participantName}`
//       );
//       const outgoingCall = useCallStore.getState().outgoingCall;

//       // Get current room name from URL
//       const currentRoomName = searchParams.get("roomName");
//       const alreadyInRoom =
//         isRoom && currentRoomName === outgoingCall?.roomName;

//       if (acceptedRoom && outgoingCall?.roomName === acceptedRoom) {
//         // ✅ Only navigate if not already in the correct room
//         if (!alreadyInRoom) {
//           router.push(
//             `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${
//               outgoingCall.callerToken
//             }&roomName=${outgoingCall.roomName}&user=${
//               outgoingCall.callerName
//             }&audioOnly=${outgoingCall.audioOnly ? "true" : "false"}`
//           );
//         }

//         useCallStore.getState().clearOutgoingCall();
//         localStorage.removeItem(`callAccepted-${participantName}`);
//       }
//     };

//     checkCallAccepted();
//     window.addEventListener("focus", checkCallAccepted);
//     return () => window.removeEventListener("focus", checkCallAccepted);
//   }, [router, isInbox, isRoom, participantName, searchParams]);

//   // ✅ Call declined (caller side)
//   useEffect(() => {
//     if (!isInbox && !isRoom) return; // ✅ allow both views

//     const checkCallDeclined = () => {
//       const declinedRoom = localStorage.getItem("callDeclined");
//       const outgoingCall = useCallStore.getState().outgoingCall;

//       if (declinedRoom && outgoingCall?.roomName === declinedRoom) {
//         useCallStore.getState().clearOutgoingCall();
//         localStorage.removeItem("callDeclined");
//       }
//     };

//     checkCallDeclined();
//     window.addEventListener("focus", checkCallDeclined);
//     return () => window.removeEventListener("focus", checkCallDeclined);
//   }, [isInbox]);

//   // ✅ Manual cancel (callee side)
//   useEffect(() => {
//     if (!isInbox && !isRoom) return;

//     const checkManualCancel = () => {
//       const declinedRoom = localStorage.getItem("callDeclined");
//       const incomingCall = useCallStore.getState().incomingCall;

//       if (declinedRoom === "manual-cancel" && incomingCall) {
//         useCallStore.getState().clearIncomingCall();
//         localStorage.removeItem("callDeclined");
//       }
//     };

//     checkManualCancel();
//     window.addEventListener("focus", checkManualCancel);
//     return () => window.removeEventListener("focus", checkManualCancel);
//   }, [isInbox, isRoom]);

//   // ✅ Clear outgoing call only when returning to inbox
//   useEffect(() => {
//     if (!isInbox) return;
//     useCallStore.getState().clearOutgoingCall();
//   }, [isInbox]);
// }

"use client";

import { useEffect } from "react";
import { useCallStore } from "@/store/useCallStore";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase/firebaseMessaging";

/**
 * useCallSignaling handles:
 * - Receiving FCM push messages (callee side)
 * - Navigating caller to room after acceptance
 * - Cleaning up outgoing call state
 * - Optional fallback polling for missed or declined calls
 */
export function useCallSignaling() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  const setIncomingCall = useCallStore((s) => s.setIncomingCall);
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);
  const outgoingCall = useCallStore((s) => s.outgoingCall);
  const clearOutgoingCall = useCallStore((s) => s.clearOutgoingCall);

  const isInbox = pathname === "/";
  const isRoom = pathname?.startsWith("/custom");

  // ✅ Listen for FCM push messages (callee side)
  useEffect(() => {
    if (!messaging) {
      console.warn("FCM messaging not initialized");
      return;
    }

    console.log("Setting up FCM onMessage listener");

    onMessage(messaging, (payload) => {
      console.log("FCM message received:", payload);

      if (payload.data?.type === "incoming_call") {
        const { roomName, callerName, liveKitUrl, audioOnly } = payload.data;

        // ✅ Parse callerAvatar from string back to object
        let callerAvatar = null;
        try {
          callerAvatar = JSON.parse(payload.data.callerAvatar);
        } catch (err) {
          console.warn("Failed to parse callerAvatar:", err);
        }

        console.log("Incoming call from:", callerName, "Room:", roomName);

        setIncomingCall({
          callerName,
          callerAvatar,
          roomName,
          liveKitUrl,
          audioOnly: audioOnly === "true",
        });

        const audio = new Audio("/ringtone.mp3");
        audio.loop = true;
        audio.play();

        setTimeout(() => {
          console.log("Call timed out — clearing incoming call");
          clearIncomingCall();
          audio.pause();
        }, 30000);
      }
    });
  }, [setIncomingCall, clearIncomingCall]);

  // ✅ Navigate caller to room after callee accepts
  useEffect(() => {
    if (!isInbox && !isRoom) return;

    if (outgoingCall && outgoingCall.roomName) {
      const currentRoomName = searchParams.get("roomName");
      const alreadyInRoom = isRoom && currentRoomName === outgoingCall.roomName;

      if (!alreadyInRoom) {
        console.log("Navigating caller to room:", outgoingCall.roomName);

        router.push(
          `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${
            outgoingCall.callerToken
          }&roomName=${outgoingCall.roomName}&user=${
            outgoingCall.callerName
          }&audioOnly=${outgoingCall.audioOnly ? "true" : "false"}`
        );
      }

      clearOutgoingCall();
    }
  }, [outgoingCall, isInbox, isRoom, searchParams]);

  // ✅ Clear outgoing call when returning to inbox
  useEffect(() => {
    if (isInbox) {
      console.log("Returned to inbox — clearing outgoing call");
      clearOutgoingCall();
    }
  }, [isInbox]);

  // 🟡 Optional: fallback polling for missed call detection
  useEffect(() => {
    const checkMissedCall = () => {
      const incomingCall = useCallStore.getState().incomingCall;
      const outgoingCall = useCallStore.getState().outgoingCall;

      if (incomingCall) {
        console.log("Incoming call still active:", incomingCall);
      }

      if (outgoingCall) {
        console.log("Outgoing call still pending:", outgoingCall);
      }
    };

    window.addEventListener("focus", checkMissedCall);
    return () => window.removeEventListener("focus", checkMissedCall);
  }, []);
}
