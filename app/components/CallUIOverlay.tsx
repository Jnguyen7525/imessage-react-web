// "use client";

// import { useCallStore } from "@/store/useCallStore";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";

// import { IncomingCallPopup } from "./IncomingCall";
// import { OutgoingCallStatus } from "./OutgoingCall";
// import { useCallSignaling } from "@/hooks/useCallSignaling";
// import React from "react";
// import { useMaybeRoomContext, useRoomContext } from "@livekit/components-react";
// import toast from "react-hot-toast";
// import { RoomEvent, Track } from "livekit-client";
// import { useRoomBridgeStore } from "@/store/useRoomBridgeStore";

// export default function CallUIOverlay() {
//   useCallSignaling(); // ✅ This runs all the signaling logic

//   // const room = useMaybeRoomContext(); // ✅ Safe fallback
//   const room = useRoomBridgeStore((s) => s.room);

//   const incomingCall = useCallStore((s) => s.incomingCall);
//   const outgoingCall = useCallStore((s) => s.outgoingCall);
//   const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();

//   const participantName = searchParams.get("user") ?? "anonymous";

//   const [showRoomSwitchModal, setShowRoomSwitchModal] = React.useState(false);
//   const [pendingCallData, setPendingCallData] = React.useState<null | {
//     roomName: string;
//     liveKitUrl: string;
//     audioOnly: boolean;
//     callerName: string;
//   }>(null);

//   const joinRoom = async (
//     roomName: string,
//     liveKitUrl: string,
//     audioOnly: boolean,
//     callerName: string
//   ) => {
//     if (room && room.state === "connected") {
//       console.log("Disconnecting from current room:", room.name);
//       await room.disconnect(); // ✅ Cleanly leave current room
//     }
//     console.log("Joining new room:", roomName, room, room?.state);
//     const res = await fetch(
//       `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
//     );
//     const data = await res.json();

//     localStorage.setItem(`callAccepted-${callerName}`, roomName);

//     router.push(
//       `/custom/?liveKitUrl=${data.serverUrl}&token=${
//         data.participantToken
//       }&roomName=${roomName}&user=${participantName}&audioOnly=${
//         audioOnly ? "true" : "false"
//       }`
//     );
//   };

//   React.useEffect(() => {
//     if (!pathname.startsWith("/custom")) {
//       useRoomBridgeStore.getState().setRoom(null);
//     }
//   }, [pathname]);

//   React.useEffect(() => {
//     return () => {
//       useCallStore.getState().clearOutgoingCall();
//     };
//   }, []);

//   if (incomingCall) {
//     const currentRoomName = searchParams.get("roomName");
//     const isAlreadyInRoom = currentRoomName && pathname.startsWith("/custom");
//     const isDifferentRoom = currentRoomName !== incomingCall.roomName;

//     const handleAccept = async () => {
//       if (isAlreadyInRoom && isDifferentRoom) {
//         setPendingCallData({
//           roomName: incomingCall.roomName,
//           liveKitUrl: incomingCall.liveKitUrl,
//           audioOnly: incomingCall.audioOnly ?? false,
//           callerName: incomingCall.callerName,
//         });
//         setShowRoomSwitchModal(true);
//         return;
//       }

//       await joinRoom(
//         incomingCall.roomName,
//         incomingCall.liveKitUrl,
//         incomingCall.audioOnly ?? false,
//         incomingCall.callerName
//       );
//       clearIncomingCall();
//     };

//     return (
//       <>
//         <IncomingCallPopup
//           callerName={incomingCall.callerName}
//           callerAvatar={incomingCall.callerAvatar}
//           onAccept={handleAccept}
//           onReject={() => {
//             localStorage.setItem("callDeclined", incomingCall.roomName);
//             clearIncomingCall();
//           }}
//         />

//         {showRoomSwitchModal && pendingCallData && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-zinc-900 text-white p-6 rounded-lg shadow-lg max-w-md w-full">
//               <h2 className="text-lg font-semibold mb-4">Switch Rooms?</h2>
//               <p className="mb-6">
//                 You're currently in a meeting. Accepting this call will move you
//                 to a new room. Do you want to continue?
//               </p>
//               <div className="flex justify-end gap-4">
//                 <button
//                   className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
//                   onClick={() => {
//                     setShowRoomSwitchModal(false);
//                     clearIncomingCall();
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
//                   onClick={async () => {
//                     await joinRoom(
//                       pendingCallData.roomName,
//                       pendingCallData.liveKitUrl,
//                       pendingCallData.audioOnly,
//                       pendingCallData.callerName
//                     );
//                     setShowRoomSwitchModal(false);
//                     clearIncomingCall();
//                   }}
//                 >
//                   Switch Room
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </>
//     );
//   }

//   if (outgoingCall) {
//     return (
//       <OutgoingCallStatus
//         calleeName={outgoingCall.calleeName}
//         calleeAvatar={outgoingCall.calleeAvatar}
//       />
//     );
//   }

//   return null;
// }

// "use client";

// import { useCallStore } from "@/store/useCallStore";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { IncomingCallPopup } from "./IncomingCall";
// import { OutgoingCallStatus } from "./OutgoingCall";
// import { useCallSignaling } from "@/hooks/useCallSignaling";
// import React from "react";
// import { useRoomBridgeStore } from "@/store/useRoomBridgeStore";

// export default function CallUIOverlay() {
//   useCallSignaling(); // ✅ Listens for FCM messages and updates Zustand

//   const room = useRoomBridgeStore((s) => s.room);
//   const incomingCall = useCallStore((s) => s.incomingCall);
//   const outgoingCall = useCallStore((s) => s.outgoingCall);
//   const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const participantName = searchParams.get("user") ?? "anonymous";

//   const [showRoomSwitchModal, setShowRoomSwitchModal] = React.useState(false);
//   const [pendingCallData, setPendingCallData] = React.useState<null | {
//     roomName: string;
//     liveKitUrl: string;
//     audioOnly: boolean;
//     callerName: string;
//   }>(null);

//   // 🔄 Join a LiveKit room
//   const joinRoom = async (
//     roomName: string,
//     liveKitUrl: string,
//     audioOnly: boolean,
//     callerName: string
//   ) => {
//     if (room && room.state === "connected") {
//       console.log("Disconnecting from current room:", room.name);
//       await room.disconnect(); // ✅ Leave current room cleanly
//     }

//     console.log("Joining new room:", roomName);
//     const res = await fetch(
//       `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
//     );
//     const data = await res.json();

//     // ✅ Navigate to the room — no need for localStorage
//     router.push(
//       `/custom/?liveKitUrl=${data.serverUrl}&token=${
//         data.participantToken
//       }&roomName=${roomName}&user=${participantName}&audioOnly=${
//         audioOnly ? "true" : "false"
//       }`
//     );
//   };

//   // 🧹 Clear room context if not on /custom
//   React.useEffect(() => {
//     if (!pathname.startsWith("/custom")) {
//       useRoomBridgeStore.getState().setRoom(null);
//     }
//   }, [pathname]);

//   // 🧹 Clear outgoing call on unmount
//   React.useEffect(() => {
//     return () => {
//       useCallStore.getState().clearOutgoingCall();
//     };
//   }, []);

//   React.useEffect(() => {
//     console.log("Incoming call state:", incomingCall);
//   }, [incomingCall]);

//   React.useEffect(() => {
//     console.log("Outgoing call state:", outgoingCall);
//   }, [outgoingCall]);

//   // ✅ Incoming call UI
//   if (incomingCall) {
//     const currentRoomName = searchParams.get("roomName");
//     const isAlreadyInRoom = currentRoomName && pathname.startsWith("/custom");
//     const isDifferentRoom = currentRoomName !== incomingCall.roomName;

//     const handleAccept = async () => {
//       if (isAlreadyInRoom && isDifferentRoom) {
//         // 🧠 Prompt user to switch rooms
//         setPendingCallData({
//           roomName: incomingCall.roomName,
//           liveKitUrl: incomingCall.liveKitUrl,
//           audioOnly: incomingCall.audioOnly ?? false,
//           callerName: incomingCall.callerName,
//         });
//         setShowRoomSwitchModal(true);
//         return;
//       }

//       await joinRoom(
//         incomingCall.roomName,
//         incomingCall.liveKitUrl,
//         incomingCall.audioOnly ?? false,
//         incomingCall.callerName
//       );
//       clearIncomingCall();
//     };

//     return (
//       <>
//         <IncomingCallPopup
//           callerName={incomingCall.callerName}
//           callerAvatar={incomingCall.callerAvatar}
//           onAccept={handleAccept}
//           onReject={() => {
//             // ❌ Remove localStorage — just clear state
//             clearIncomingCall();
//           }}
//         />

//         {/* 🧠 Modal for switching rooms */}
//         {showRoomSwitchModal && pendingCallData && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-zinc-900 text-white p-6 rounded-lg shadow-lg max-w-md w-full">
//               <h2 className="text-lg font-semibold mb-4">Switch Rooms?</h2>
//               <p className="mb-6">
//                 You're currently in a meeting. Accepting this call will move you
//                 to a new room. Do you want to continue?
//               </p>
//               <div className="flex justify-end gap-4">
//                 <button
//                   className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
//                   onClick={() => {
//                     setShowRoomSwitchModal(false);
//                     clearIncomingCall();
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
//                   onClick={async () => {
//                     await joinRoom(
//                       pendingCallData.roomName,
//                       pendingCallData.liveKitUrl,
//                       pendingCallData.audioOnly,
//                       pendingCallData.callerName
//                     );
//                     setShowRoomSwitchModal(false);
//                     clearIncomingCall();
//                   }}
//                 >
//                   Switch Room
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </>
//     );
//   }

//   // ✅ Outgoing call UI
//   if (outgoingCall) {
//     return (
//       <OutgoingCallStatus
//         calleeName={outgoingCall.calleeName}
//         calleeAvatar={outgoingCall.calleeAvatar}
//       />
//     );
//   }

//   return null;
// }

"use client";

import { useCallStore } from "@/store/useCallStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IncomingCallPopup } from "./IncomingCall";
import { OutgoingCallStatus } from "./OutgoingCall";
import { useCallSignaling } from "@/hooks/useCallSignaling";
import React from "react";
import { useRoomBridgeStore } from "@/store/useRoomBridgeStore";
import { Room } from "livekit-client";
import createClient from "@/lib/supabase/client";
import { useConversationStore } from "@/store/useConversationStore";

export default function CallUIOverlay() {
  const [participantName, setParticipantName] = React.useState("anonymous");
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (user) {
        setUserId(user.id); // ✅ store caller ID
        const name =
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "anonymous";
        setParticipantName(name);
      }
    });
  }, []);

  useCallSignaling(); // ✅ Listens for FCM messages and updates Zustand

  const room = useRoomBridgeStore((s) => s.room);

  const incomingCall = useCallStore((s) => s.incomingCall);
  const outgoingCall = useCallStore((s) => s.outgoingCall);
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);

  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );

  console.log("👀 CallUIOverlay mounted. Incoming call:", incomingCall);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  // const participantName = searchParams.get("user") ?? "anonymous";

  const [showRoomSwitchModal, setShowRoomSwitchModal] = React.useState(false);
  const [pendingCallData, setPendingCallData] = React.useState<null | {
    roomName: string;
    liveKitUrl: string;
    audioOnly: boolean;
    callerName: string;
  }>(null);

  const previousRoomRef = React.useRef<Room | null>(null);

  React.useEffect(() => {
    previousRoomRef.current = useRoomBridgeStore.getState().room;
  }, [incomingCall]);

  // 🔄 Join a LiveKit room
  const joinRoom = async (
    roomName: string,
    liveKitUrl: string,
    audioOnly: boolean,
    callerName: string
  ) => {
    const currentRoom = useRoomBridgeStore.getState().room;
    if (currentRoom && currentRoom.state === "connected") {
      console.log("🔌 Disconnecting from previous room:", currentRoom);
      await currentRoom.disconnect();
    } else {
      console.log("⚠️ No connected room to disconnect");
    }

    console.log("old room:", currentRoom);
    console.log("Joining new room:", roomName, room);
    const res = await fetch(
      `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
    );
    const data = await res.json();

    console.log(
      "🚀 Navigating to room:",
      roomName,
      "with identity:",
      participantName
    );
    // ✅ Navigate to the room — no need for localStorage
    router.push(
      `/custom/?liveKitUrl=${data.serverUrl}&token=${
        data.participantToken
      }&roomName=${roomName}&user=${participantName}&audioOnly=${
        audioOnly ? "true" : "false"
      }`
    );
  };

  React.useEffect(() => {
    const unsub = useRoomBridgeStore.subscribe((state) => {
      const room = state.room;
      console.log(
        "📡 RoomBridgeStore updated in CallUIOverlay:",
        room?.name,
        room?.state,
        room
      );
    });

    return () => unsub();
  }, []);

  // 🧹 Clear room context if not on /custom

  React.useEffect(() => {
    if (pathname === "/") {
      setTimeout(() => {
        const currentRoom = useRoomBridgeStore.getState().room;
        console.log("🧹 Checking for room reset on inbox return");
        console.log(
          "🔍 RoomBridgeStore before clearing:",
          currentRoom?.name,
          currentRoom?.state,
          currentRoom
        );

        if (currentRoom !== null) {
          useRoomBridgeStore.getState().setRoom(null);
          console.log("🧹 RoomBridgeStore cleared — now set to null");
        } else {
          console.log("✅ No room to clear — already null");
        }
      }, 0);
    }
  }, [pathname]);

  // 🧹 Clear outgoing call on unmount
  React.useEffect(() => {
    return () => {
      useCallStore.getState().clearOutgoingCall();
    };
  }, []);

  // ✅ Incoming call UI
  if (incomingCall) {
    const handleAccept = async () => {
      const currentRoomName = searchParams.get("roomName");
      const isAlreadyInRoom =
        pathname.startsWith("/custom") &&
        currentRoomName === incomingCall.roomName;

      const isDifferentRoom =
        pathname.startsWith("/custom") &&
        currentRoomName !== incomingCall.roomName;

      // ✅ Always notify caller
      await fetch("/api/send-call-accepted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // callerId: incomingCall.callerName,
          // callerId: userId ?? "", // ✅ FIXED
          callerId: incomingCall.callerId,
          roomName: incomingCall.roomName,
          liveKitUrl: incomingCall.liveKitUrl,
          callerToken: incomingCall.callerToken,
          callerName: incomingCall.callerName,
          audioOnly: incomingCall.audioOnly,
        }),
      });

      console.log("📞 Incoming call accepted:");
      console.log("🔍 Current pathname:", pathname);
      console.log("🔍 Current roomName from URL:", currentRoomName);
      console.log("🔍 Incoming call roomName:", incomingCall.roomName);
      console.log("🔍 isAlreadyInRoom:", isAlreadyInRoom);
      console.log("🔍 isDifferentRoom:", isDifferentRoom);

      const currentRoom = useRoomBridgeStore.getState().room;
      console.log(
        "🔍 RoomBridgeStore current room:",
        currentRoom?.name,
        currentRoom?.state,
        room,
        currentRoom
      );

      if (isAlreadyInRoom) {
        console.log("✅ Already in correct room — skipping navigation");
        clearIncomingCall();
        return;
      }

      if (isDifferentRoom) {
        setPendingCallData({
          roomName: incomingCall.roomName,
          liveKitUrl: incomingCall.liveKitUrl,
          audioOnly: incomingCall.audioOnly ?? false,
          callerName: incomingCall.callerName,
        });
        setShowRoomSwitchModal(true);
        return;
      }

      await joinRoom(
        incomingCall.roomName,
        incomingCall.liveKitUrl,
        incomingCall.audioOnly ?? false,
        incomingCall.callerName
      );

      clearIncomingCall();
    };

    return (
      <>
        <IncomingCallPopup
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          onAccept={handleAccept}
          onReject={async () => {
            console.log("❌ Call manually declined");

            // ✅ Notify caller via FCM
            await fetch("/api/send-call-declined", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                callerId: incomingCall.callerId,
                roomName: incomingCall.roomName,
                manualCancel: false, // ✅ flag for manual cancel
              }),
            });

            clearIncomingCall();
          }}
        />

        {/* 🧠 Modal for switching rooms */}
        {showRoomSwitchModal && pendingCallData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-900 text-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">Switch Rooms?</h2>
              <p className="mb-6">
                You're currently in a meeting. Accepting this call will move you
                to a new room. Do you want to continue?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
                  onClick={() => {
                    console.log("🚫 Room switch canceled");

                    setShowRoomSwitchModal(false);
                    clearIncomingCall();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
                  onClick={async () => {
                    console.log("✅ Switching to new room");

                    await joinRoom(
                      pendingCallData.roomName,
                      pendingCallData.liveKitUrl,
                      pendingCallData.audioOnly,
                      pendingCallData.callerName
                    );

                    // ✅ Notify caller before switching
                    await fetch("/api/send-call-accepted", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        callerId: pendingCallData.callerName,
                        // callerId: userId ?? "", // ✅ FIXED

                        roomName: pendingCallData.roomName,
                        liveKitUrl: pendingCallData.liveKitUrl,
                        callerToken: incomingCall?.callerToken,
                        callerName: pendingCallData.callerName,
                        audioOnly: pendingCallData.audioOnly,
                      }),
                    });

                    setShowRoomSwitchModal(false);
                    clearIncomingCall();
                  }}
                >
                  Switch Room
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ✅ Outgoing call UI
  if (outgoingCall) {
    return (
      <OutgoingCallStatus
        calleeName={outgoingCall.calleeName}
        calleeId={outgoingCall.calleeId}
        calleeAvatar={outgoingCall.calleeAvatar}
      />
    );
  }

  return null;
}
