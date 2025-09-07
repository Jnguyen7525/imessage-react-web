"use client";

import { useEffect } from "react";
import { useCallStore } from "@/store/useCallStore";
import { useSearchParams, useRouter } from "next/navigation";

export function useCallSignaling() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  const setIncomingCall = useCallStore((s) => s.setIncomingCall);
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);

  //   useEffect(() => {
  //     const checkIncomingCall = () => {
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

  //     window.addEventListener("focus", checkIncomingCall);
  //     return () => window.removeEventListener("focus", checkIncomingCall);
  //   }, [participantName, setIncomingCall, clearIncomingCall]);
  //! this is for listening for incoming calls to accept joining a room on the callee side
  useEffect(() => {
    const checkIncomingCall = () => {
      // const callData = localStorage.getItem("incomingCall");
      const callData = localStorage.getItem(`incomingCall-${participantName}`);
      if (callData) {
        const { roomName, caller, liveKitUrl, callerAvatar } =
          JSON.parse(callData);

        setIncomingCall({
          callerName: caller,
          callerAvatar,
          roomName,
          liveKitUrl,
        });

        // Optional: play ringtone
        const audio = new Audio("/ringtone.mp3");
        audio.loop = true;
        audio.play();

        // Timeout after 30 seconds
        setTimeout(() => {
          clearIncomingCall();
          audio.pause();
        }, 30000);

        // localStorage.removeItem("incomingCall");
        localStorage.removeItem(`incomingCall-${participantName}`);
      }
    };

    window.addEventListener("focus", checkIncomingCall);
    return () => window.removeEventListener("focus", checkIncomingCall);
  }, [participantName, setIncomingCall, clearIncomingCall, router]);

  //   useEffect(() => {
  //     const checkCallAccepted = () => {
  //       const acceptedRoom = localStorage.getItem("callAccepted");
  //       const outgoingCall = useCallStore.getState().outgoingCall;

  //       if (acceptedRoom && outgoingCall?.roomName === acceptedRoom) {
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
  //! this is listening for when callee accepts the outgoing call to joing the room on the caller side
  useEffect(() => {
    const checkCallAccepted = () => {
      const acceptedRoom = localStorage.getItem("callAccepted");
      const outgoingCall = useCallStore.getState().outgoingCall;

      if (acceptedRoom && outgoingCall?.roomName === acceptedRoom) {
        // router.push(
        //   `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${outgoingCall.callerToken}&roomName=${outgoingCall.roomName}`
        // );
        router.push(
          `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${outgoingCall.callerToken}&roomName=${outgoingCall.roomName}&user=${outgoingCall.callerName}`
        );

        useCallStore.getState().clearOutgoingCall();
        localStorage.removeItem("callAccepted");
      }
    };

    window.addEventListener("focus", checkCallAccepted);
    return () => window.removeEventListener("focus", checkCallAccepted);
  }, [router]);

  //   useEffect(() => {
  //     const checkCallDeclined = () => {
  //       const declinedRoom = localStorage.getItem("callDeclined");
  //       const outgoingCall = useCallStore.getState().outgoingCall;

  //       if (declinedRoom && outgoingCall?.roomName === declinedRoom) {
  //         useCallStore.getState().clearOutgoingCall();
  //         localStorage.removeItem("callDeclined");
  //       }
  //     };

  //     window.addEventListener("focus", checkCallDeclined);
  //     return () => window.removeEventListener("focus", checkCallDeclined);
  //   }, []);

  // !this is for listening for when the outgoing call is rejected or was not accepted by the callee
  useEffect(() => {
    const checkCallDeclined = () => {
      const declinedRoom = localStorage.getItem("callDeclined");
      const outgoingCall = useCallStore.getState().outgoingCall;

      if (declinedRoom && outgoingCall?.roomName === declinedRoom) {
        // alert(`${outgoingCall.calleeName} declined the call`);
        useCallStore.getState().clearOutgoingCall();
        localStorage.removeItem("callDeclined");
      }
    };

    window.addEventListener("focus", checkCallDeclined);
    return () => window.removeEventListener("focus", checkCallDeclined);
  }, []);

  //   useEffect(() => {
  //     const checkManualCancel = () => {
  //       const declinedRoom = localStorage.getItem("callDeclined");
  //       const incomingCall = useCallStore.getState().incomingCall;

  //       if (declinedRoom === "manual-cancel" && incomingCall) {
  //         useCallStore.getState().clearIncomingCall();
  //         localStorage.removeItem("callDeclined");
  //       }
  //     };

  //     window.addEventListener("focus", checkManualCancel);
  //     return () => window.removeEventListener("focus", checkManualCancel);
  //   }, []);
  // ! this is for when caller manually cancels the call
  useEffect(() => {
    const checkManualCancel = () => {
      const outgoingCall = useCallStore.getState().outgoingCall;
      const declinedRoom = localStorage.getItem("callDeclined");
      const incomingCall = useCallStore.getState().incomingCall;

      if (declinedRoom === "manual-cancel" && incomingCall) {
        // alert(`${outgoingCall?.calleeName} declined or canceled the call`);

        useCallStore.getState().clearIncomingCall();
        localStorage.removeItem("callDeclined");
      }
    };

    window.addEventListener("focus", checkManualCancel);
    return () => window.removeEventListener("focus", checkManualCancel);
  }, []);

//   useEffect(() => {
//     useCallStore.getState().clearOutgoingCall();
//   }, []);
  // !this is the clear the outgoing call each time we navigate back to main page so that previous call isn't make again
  useEffect(() => {
    useCallStore.getState().clearOutgoingCall();
  }, []);
}
