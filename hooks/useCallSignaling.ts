// "use client";

// import { useEffect } from "react";
// import { useCallStore } from "@/store/useCallStore";
// import { useSearchParams, useRouter } from "next/navigation";

// export function useCallSignaling() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const participantName = searchParams.get("user") ?? "anonymous";

//   const setIncomingCall = useCallStore((s) => s.setIncomingCall);
//   const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);

//   //! this is for listening for incoming calls to accept joining a room on the callee side
//   useEffect(() => {
//     const checkIncomingCall = () => {
//       // const callData = localStorage.getItem("incomingCall");
//       const callData = localStorage.getItem(`incomingCall-${participantName}`);
//       if (callData) {
//         const { roomName, caller, liveKitUrl, callerAvatar } =
//           JSON.parse(callData);

//         setIncomingCall({
//           callerName: caller,
//           callerAvatar,
//           roomName,
//           liveKitUrl,
//         });

//         // Optional: play ringtone
//         const audio = new Audio("/ringtone.mp3");
//         audio.loop = true;
//         audio.play();

//         // Timeout after 30 seconds
//         setTimeout(() => {
//           clearIncomingCall();
//           audio.pause();
//         }, 30000);

//         // localStorage.removeItem("incomingCall");
//         localStorage.removeItem(`incomingCall-${participantName}`);
//       }
//     };

//     window.addEventListener("focus", checkIncomingCall);
//     return () => window.removeEventListener("focus", checkIncomingCall);
//   }, [participantName, setIncomingCall, clearIncomingCall, router]);

//   //! this is listening for when callee accepts the outgoing call to joing the room on the caller side
//   useEffect(() => {
//     const checkCallAccepted = () => {
//       const acceptedRoom = localStorage.getItem("callAccepted");
//       const outgoingCall = useCallStore.getState().outgoingCall;

//       if (acceptedRoom && outgoingCall?.roomName === acceptedRoom) {
//         // router.push(
//         //   `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${outgoingCall.callerToken}&roomName=${outgoingCall.roomName}`
//         // );
//         router.push(
//           `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${outgoingCall.callerToken}&roomName=${outgoingCall.roomName}&user=${outgoingCall.callerName}`
//         );

//         useCallStore.getState().clearOutgoingCall();
//         localStorage.removeItem("callAccepted");
//       }
//     };

//     window.addEventListener("focus", checkCallAccepted);
//     return () => window.removeEventListener("focus", checkCallAccepted);
//   }, [router]);

//   // !this is for listening for when the outgoing call is rejected or was not accepted by the callee
//   useEffect(() => {
//     const checkCallDeclined = () => {
//       const declinedRoom = localStorage.getItem("callDeclined");
//       const outgoingCall = useCallStore.getState().outgoingCall;

//       if (declinedRoom && outgoingCall?.roomName === declinedRoom) {
//         // alert(`${outgoingCall.calleeName} declined the call`);
//         useCallStore.getState().clearOutgoingCall();
//         localStorage.removeItem("callDeclined");
//       }
//     };

//     window.addEventListener("focus", checkCallDeclined);
//     return () => window.removeEventListener("focus", checkCallDeclined);
//   }, []);

//   // ! this is for when caller manually cancels the call
//   useEffect(() => {
//     const checkManualCancel = () => {
//       const outgoingCall = useCallStore.getState().outgoingCall;
//       const declinedRoom = localStorage.getItem("callDeclined");
//       const incomingCall = useCallStore.getState().incomingCall;

//       if (declinedRoom === "manual-cancel" && incomingCall) {
//         // alert(`${outgoingCall?.calleeName} declined or canceled the call`);

//         useCallStore.getState().clearIncomingCall();
//         localStorage.removeItem("callDeclined");
//       }
//     };

//     window.addEventListener("focus", checkManualCancel);
//     return () => window.removeEventListener("focus", checkManualCancel);
//   }, []);

//   // !this is the clear the outgoing call each time we navigate back to main page so that previous call isn't make again
//   useEffect(() => {
//     useCallStore.getState().clearOutgoingCall();
//   }, []);
// }

"use client";

import { useEffect } from "react";
import { useCallStore } from "@/store/useCallStore";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useCallSignaling() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  const setIncomingCall = useCallStore((s) => s.setIncomingCall);
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);

  const isInbox = pathname === "/";
  const isRoom = pathname?.startsWith("/custom");

  // ✅ Incoming call popup (callee side)
  useEffect(() => {
    if (!isInbox && !isRoom) return;

    const checkIncomingCall = () => {
      const callData = localStorage.getItem(`incomingCall-${participantName}`);
      if (callData) {
        // const { roomName, caller, liveKitUrl, callerAvatar } =
        //   JSON.parse(callData);
        const { roomName, caller, liveKitUrl, callerAvatar, audioOnly } =
          JSON.parse(callData);

        setIncomingCall({
          callerName: caller,
          callerAvatar,
          roomName,
          liveKitUrl,
          audioOnly, // ✅ Add this
        });

        const audio = new Audio("/ringtone.mp3");
        audio.loop = true;
        audio.play();

        setTimeout(() => {
          clearIncomingCall();
          audio.pause();
        }, 30000);

        localStorage.removeItem(`incomingCall-${participantName}`);
      }
    };

    checkIncomingCall(); // ✅ run immediately
    window.addEventListener("focus", checkIncomingCall);
    return () => window.removeEventListener("focus", checkIncomingCall);
  }, [participantName, setIncomingCall, clearIncomingCall, isInbox, isRoom]);

  // ✅ Call accepted (caller side)
  useEffect(() => {
    if (!isInbox && !isRoom) return; // ✅ allow both inbox and room views

    const checkCallAccepted = () => {
      const acceptedRoom = localStorage.getItem(
        `callAccepted-${participantName}`
      );
      const outgoingCall = useCallStore.getState().outgoingCall;

      // Get current room name from URL
      const currentRoomName = searchParams.get("roomName");
      const alreadyInRoom =
        isRoom && currentRoomName === outgoingCall?.roomName;

      if (acceptedRoom && outgoingCall?.roomName === acceptedRoom) {
        // ✅ Only navigate if not already in the correct room
        if (!alreadyInRoom) {
          // router.push(
          //   `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${outgoingCall.callerToken}&roomName=${outgoingCall.roomName}&user=${outgoingCall.callerName}`
          // );
          router.push(
            `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${
              outgoingCall.callerToken
            }&roomName=${outgoingCall.roomName}&user=${
              outgoingCall.callerName
            }&audioOnly=${outgoingCall.audioOnly ? "true" : "false"}`
          );
        }

        useCallStore.getState().clearOutgoingCall();
        localStorage.removeItem(`callAccepted-${participantName}`);
      }
    };

    checkCallAccepted();
    window.addEventListener("focus", checkCallAccepted);
    return () => window.removeEventListener("focus", checkCallAccepted);
  }, [router, isInbox, isRoom, participantName, searchParams]);

  // ✅ Call declined (caller side)
  useEffect(() => {
    if (!isInbox && !isRoom) return; // ✅ allow both views

    const checkCallDeclined = () => {
      const declinedRoom = localStorage.getItem("callDeclined");
      const outgoingCall = useCallStore.getState().outgoingCall;

      if (declinedRoom && outgoingCall?.roomName === declinedRoom) {
        useCallStore.getState().clearOutgoingCall();
        localStorage.removeItem("callDeclined");
      }
    };

    checkCallDeclined();
    window.addEventListener("focus", checkCallDeclined);
    return () => window.removeEventListener("focus", checkCallDeclined);
  }, [isInbox]);

  // ✅ Manual cancel (callee side)
  useEffect(() => {
    if (!isInbox && !isRoom) return;

    const checkManualCancel = () => {
      const declinedRoom = localStorage.getItem("callDeclined");
      const incomingCall = useCallStore.getState().incomingCall;

      if (declinedRoom === "manual-cancel" && incomingCall) {
        useCallStore.getState().clearIncomingCall();
        localStorage.removeItem("callDeclined");
      }
    };

    checkManualCancel();
    window.addEventListener("focus", checkManualCancel);
    return () => window.removeEventListener("focus", checkManualCancel);
  }, [isInbox, isRoom]);

  // ✅ Clear outgoing call only when returning to inbox
  useEffect(() => {
    if (!isInbox) return;
    useCallStore.getState().clearOutgoingCall();
  }, [isInbox]);
}
