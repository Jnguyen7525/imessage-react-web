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

// "use client";

// import { useEffect } from "react";
// import { useCallStore } from "@/store/useCallStore";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import { onMessage } from "firebase/messaging";
// import { messaging } from "@/lib/firebase/firebaseMessaging";

// export function useCallSignaling() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const participantName = searchParams.get("user") ?? "anonymous";

//   const setIncomingCall = useCallStore((s) => s.setIncomingCall);
//   const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);
//   const outgoingCall = useCallStore((s) => s.outgoingCall);
//   const clearOutgoingCall = useCallStore((s) => s.clearOutgoingCall);

//   const isInbox = pathname === "/";
//   const isRoom = pathname?.startsWith("/custom");

//   // ✅ Listen for FCM push messages (callee side)
//   useEffect(() => {
//     if (!messaging) return;

//     const unsubscribe = onMessage(messaging, (payload) => {
//       if (payload.data?.type === "incoming_call") {
//         const { roomName, callerName, callerAvatar, liveKitUrl, audioOnly } =
//           payload.data;

//         setIncomingCall({
//           callerName,
//           callerAvatar,
//           roomName,
//           liveKitUrl,
//           audioOnly: audioOnly === "true",
//         });

//         const audio = new Audio("/ringtone.mp3");
//         audio.loop = true;
//         audio.play();

//         setTimeout(() => {
//           clearIncomingCall();
//           audio.pause();
//         }, 30000);
//       }
//     });

//     return () => {
//       // Firebase's onMessage doesn't return an unsubscribe, but we can clean up if needed
//     };
//   }, [setIncomingCall, clearIncomingCall]);

//   // ✅ Navigate caller to room after callee accepts
//   useEffect(() => {
//     if (!isInbox && !isRoom) return;

//     // This assumes callee acceptance triggers backend or Zustand update
//     if (outgoingCall && outgoingCall.roomName) {
//       const currentRoomName = searchParams.get("roomName");
//       const alreadyInRoom = isRoom && currentRoomName === outgoingCall.roomName;

//       if (!alreadyInRoom) {
//         router.push(
//           `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${
//             outgoingCall.callerToken
//           }&roomName=${outgoingCall.roomName}&user=${
//             outgoingCall.callerName
//           }&audioOnly=${outgoingCall.audioOnly ? "true" : "false"}`
//         );
//       }

//       clearOutgoingCall();
//     }
//   }, [outgoingCall, isInbox, isRoom, searchParams]);

//   // ✅ Clear outgoing call when returning to inbox
//   useEffect(() => {
//     if (isInbox) {
//       clearOutgoingCall();
//     }
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

  // ✅ Listen for messages forwarded from service worker
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.serviceWorker) return;

    const handleSWMessage = (event: MessageEvent) => {
      const raw = event.data || {};
      const type = raw.type || raw.data?.type;
      const payload = raw.payload || raw.data;

      if (!payload || payload.recipientId !== participantName) return;

      if (type === "ping") {
        console.log("✅ Ping received via service worker:", payload);
        return;
      }

      if (type === "call_accepted") {
        console.log("✅ handleCallAccepted triggered via service worker");
        console.log("Payload:", payload);

        const acceptedRoom = payload.roomName;
        const outgoingCall = useCallStore.getState().outgoingCall;
        const currentRoomName = searchParams.get("roomName");
        const alreadyInRoom = isRoom && currentRoomName === acceptedRoom;

        const liveKitUrl = outgoingCall?.liveKitUrl || payload.liveKitUrl;
        const callerToken = outgoingCall?.callerToken || payload.callerToken;
        const callerName = outgoingCall?.callerName || payload.callerName;
        const audioOnly =
          outgoingCall?.audioOnly ?? payload.audioOnly === "true";

        if (acceptedRoom) {
          if (!alreadyInRoom) {
            console.log("🚀 Navigating caller to room:", acceptedRoom);
            router.push(
              `/custom/?liveKitUrl=${liveKitUrl}&token=${callerToken}&roomName=${acceptedRoom}&user=${callerName}&audioOnly=${
                audioOnly ? "true" : "false"
              }`
            );
          }

          useCallStore.getState().clearOutgoingCall();
        }
      }

      if (type === "incoming_call") {
        console.log("✅ Incoming call received via service worker:", payload);

        let callerAvatar = null;
        try {
          callerAvatar = JSON.parse(payload.callerAvatar);
        } catch (err) {
          console.warn("Failed to parse callerAvatar from SW:", err);
        }

        setIncomingCall({
          callerName: payload.callerName,
          callerAvatar,
          roomName: payload.roomName,
          liveKitUrl: payload.liveKitUrl,
          audioOnly: payload.audioOnly === "true",
          callerToken: payload.callerToken, // ✅ Add this line
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
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, [participantName]);

  // ✅ Incoming call popup (callee side)
  // ✅ Listen for FCM push messages (callee side)
  // ✅ Foreground FCM message listener
  useEffect(() => {
    console.log("useCallSignaling mounted for:", participantName);
    if (!isInbox && !isRoom) return;
    if (!messaging) {
      console.warn("FCM messaging not initialized");
      return;
    }

    const handleIncomingCall = (payload: any) => {
      const recipientId = payload.data?.recipientId;
      console.log("FCM received:", payload.data);
      console.log("participantName:", participantName);
      console.log("recipientId:", recipientId);

      if (recipientId !== participantName) {
        console.log("Ignoring FCM message — not intended for this user");
        return;
      }

      if (payload.data?.type === "ping") {
        console.log("✅ Ping received via foreground FCM:", payload.data);
        return;
      }

      if (payload.data?.type === "incoming_call") {
        const { roomName, callerName, liveKitUrl, audioOnly } = payload.data;

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
          callerToken: payload.callerToken, // ✅ Add this line
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
    };

    onMessage(messaging, handleIncomingCall);

    const checkIncomingCall = () => {
      const incomingCall = useCallStore.getState().incomingCall;
      if (incomingCall) {
        console.log("Incoming call still active:", incomingCall);
      }
    };

    window.addEventListener("focus", checkIncomingCall);
    return () => {
      window.removeEventListener("focus", checkIncomingCall);
    };
  }, [participantName, setIncomingCall, clearIncomingCall, isInbox, isRoom]);

  // ✅ Call accepted (caller side)
  // ✅ Navigate caller to room after callee accepts
  // ✅ Call accepted
  useEffect(() => {
    // if (!isInbox && !isRoom) return;
    if (!messaging) {
      console.warn("FCM messaging not initialized");
      return;
    }

    const handleCallAccepted = (payload: any) => {
      if (payload.data?.type !== "call_accepted") return;

      const recipientId = payload.data?.recipientId;
      if (recipientId !== participantName) {
        console.log("Ignoring call_accepted — not intended for this user");
        return;
      }

      const acceptedRoom = payload.data.roomName;
      const outgoingCall = useCallStore.getState().outgoingCall;
      const currentRoomName = searchParams.get("roomName");
      const alreadyInRoom = isRoom && currentRoomName === acceptedRoom;

      console.log("🔔 call_accepted received:", payload.data);
      console.log("🔍 outgoingCall:", outgoingCall);
      console.log("🔍 acceptedRoom:", acceptedRoom);
      console.log("🔍 currentRoomName:", currentRoomName);
      console.log("🔍 alreadyInRoom:", alreadyInRoom);

      // ✅ Use Zustand if available, fallback to payload
      const liveKitUrl = outgoingCall?.liveKitUrl || payload.data.liveKitUrl;
      const callerToken = outgoingCall?.callerToken || payload.data.callerToken;
      const callerName = outgoingCall?.callerName || payload.data.callerName;
      const audioOnly =
        outgoingCall?.audioOnly ?? payload.data.audioOnly === "true";

      if (acceptedRoom) {
        if (!alreadyInRoom) {
          console.log("🚀 Navigating caller to room:", acceptedRoom);
          router.push(
            `/custom/?liveKitUrl=${liveKitUrl}&token=${callerToken}&roomName=${acceptedRoom}&user=${callerName}&audioOnly=${
              audioOnly ? "true" : "false"
            }`
          );
        }

        useCallStore.getState().clearOutgoingCall();
      }
    };

    onMessage(messaging, handleCallAccepted);

    window.addEventListener("focus", () => {
      const outgoingCall = useCallStore.getState().outgoingCall;
      if (outgoingCall) {
        console.log("Outgoing call still pending:", outgoingCall);
      }
    });

    return () => {
      window.removeEventListener("focus", () => {});
    };
  }, [router, isInbox, isRoom, participantName, searchParams]);

  // ✅ Call declined (caller side)
  useEffect(() => {
    if (!isInbox && !isRoom) return;
    if (!messaging) {
      console.warn("FCM messaging not initialized");
      return;
    }

    const handleCallDeclined = (payload: any) => {
      if (payload.data?.type !== "call_declined") return;

      const recipientId = payload.data?.recipientId;
      if (recipientId !== participantName) {
        console.log("Ignoring call_declined — not intended for this user");
        return;
      }

      const declinedRoom = payload.data.roomName;
      const outgoingCall = useCallStore.getState().outgoingCall;

      if (declinedRoom && outgoingCall?.roomName === declinedRoom) {
        console.log("Call was declined — clearing outgoing call");
        useCallStore.getState().clearOutgoingCall();
      }
    };

    // ✅ Listen for call_declined push
    const unsubscribe = onMessage(messaging, handleCallDeclined);

    // ✅ Optional fallback on tab focus
    const checkCallDeclined = () => {
      const outgoingCall = useCallStore.getState().outgoingCall;
      if (outgoingCall) {
        console.log("Outgoing call still pending:", outgoingCall);
      }
    };

    window.addEventListener("focus", checkCallDeclined);
    return () => {
      window.removeEventListener("focus", checkCallDeclined);
      // FCM onMessage cleanup placeholder
    };
  }, [isInbox, participantName]);

  // ✅ Manual cancel (callee side)

  // ✅ Clear outgoing call when returning to inbox
  useEffect(() => {
    if (isInbox) {
      console.log("Returned to inbox — clearing outgoing call");
      clearOutgoingCall();
    }
  }, [isInbox]);

  // 🟡 Optional: fallback polling for missed call detection
  // useEffect(() => {
  //   const checkMissedCall = () => {
  //     const incomingCall = useCallStore.getState().incomingCall;
  //     const outgoingCall = useCallStore.getState().outgoingCall;

  //     if (incomingCall) {
  //       console.log("Incoming call still active:", incomingCall);
  //     }

  //     if (outgoingCall) {
  //       console.log("Outgoing call still pending:", outgoingCall);
  //     }
  //   };

  //   window.addEventListener("focus", checkMissedCall);
  //   return () => window.removeEventListener("focus", checkMissedCall);
  // }, []);
}
