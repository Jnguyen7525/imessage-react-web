// "use client";

// import { useConversationStore } from "@/store/useConversationStore";
// import { Ellipsis, Phone, Video } from "lucide-react";
// import Image from "next/image";

// import { useSearchParams } from "next/navigation";
// import React, { useState } from "react";
// import { generateRoomId } from "@/lib/client-utils";
// import { useCallStore } from "@/store/useCallStore";
// import { messagesArray } from "@/utils/messages";

// function Header() {
//   const searchParams = useSearchParams();
//   const participantName = searchParams.get("user") ?? "anonymous";

//   const setOutgoingCall = useCallStore((state) => state.setOutgoingCall);

//   // !second try now with callinguioverlay
//   const startMeeting = async () => {
//     if (!selectedConversation) return;

//     const callerInfo = messagesArray.find(
//       (msg) => msg.name === participantName
//     );
//     const callerAvatar = callerInfo?.avatar ?? "";

//     const roomName = generateRoomId();

//     const res = await fetch(
//       `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
//     );
//     const data = await res.json();

//     // Simulate signaling via localStorage
//     localStorage.setItem(
//       `incomingCall-${selectedConversation.name}`,
//       JSON.stringify({
//         roomName,
//         caller: participantName,
//         liveKitUrl: data.serverUrl,
//         callerAvatar, // ✅ Now using the correct avatar
//       })
//     );

//     // Show "Calling..." UI
//     setOutgoingCall({
//       calleeName: selectedConversation.name,
//       calleeAvatar: selectedConversation.avatar,
//       roomName,
//       liveKitUrl: data.serverUrl,
//       callerToken: data.participantToken,
//       callerName: participantName, // ✅ Add this line
//     });

//     // Optional: clear after 30 seconds
//     // ⏱️ Timeout after 30 seconds if unanswered
//     setTimeout(() => {
//       const currentCall = useCallStore.getState().outgoingCall;
//       // const acceptedRoom = localStorage.getItem("callAccepted");
//       const acceptedRoom = localStorage.getItem(
//         `callAccepted-${participantName}`
//       );

//       if (currentCall?.roomName === roomName && acceptedRoom !== roomName) {
//         alert("Call timed out — no response");
//         useCallStore.getState().clearOutgoingCall();
//       }
//     }, 30000);

//     // !took this out because it was causing us to immediately join the room after clicking the call button. we want to wait until the callee accepts first
//     // router.push(
//     //   `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${roomName}`
//     // );
//   };

//   const toggleShowOptions = useConversationStore(
//     (state) => state.toggleShowOptions
//   );

//   const [showSearchBar, setShowSearchBar] = React.useState(false);
//   const [searchText, setSearchText] = React.useState("");

//   const selectedConversation = useConversationStore(
//     (state) => state.selectedConversation
//   );

//   // Optional debug
//   React.useEffect(() => {
//     console.log("Selected (via useMemo):", selectedConversation);
//   }, [selectedConversation]);

//   const startAudioCall = async () => {
//     if (!selectedConversation) return;

//     const callerInfo = messagesArray.find(
//       (msg) => msg.name === participantName
//     );
//     const callerAvatar = callerInfo?.avatar ?? "";
//     const roomName = generateRoomId();

//     const res = await fetch(
//       `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
//     );
//     const data = await res.json();

//     localStorage.setItem(
//       `incomingCall-${selectedConversation.name}`,
//       JSON.stringify({
//         roomName,
//         caller: participantName,
//         liveKitUrl: data.serverUrl,
//         callerAvatar,
//         audioOnly: true, // ✅ flag for callee
//       })
//     );

//     setOutgoingCall({
//       calleeName: selectedConversation.name,
//       calleeAvatar: selectedConversation.avatar,
//       roomName,
//       liveKitUrl: data.serverUrl,
//       callerToken: data.participantToken,
//       callerName: participantName,
//       audioOnly: true, // ✅ pass to UI logic
//     });

//     setTimeout(() => {
//       const currentCall = useCallStore.getState().outgoingCall;
//       const acceptedRoom = localStorage.getItem(
//         `callAccepted-${participantName}`
//       );
//       if (currentCall?.roomName === roomName && acceptedRoom !== roomName) {
//         alert("Audio call timed out — no response");
//         useCallStore.getState().clearOutgoingCall();
//       }
//     }, 30000);
//   };
//   return (
//     <div className="bg-[#09090b] w-full h-fit px-5 py-3 gap-12 flex text-white items-center border-b border-zinc-800">
//       <div className="">
//         {selectedConversation ? (
//           <div className="flex items-center gap-2">
//             <Image
//               className="w-12 h-12 rounded-full"
//               src={selectedConversation.avatar}
//               alt=""
//             />
//             <span className="">{selectedConversation.name}</span>
//           </div>
//         ) : (
//           <span className="">Messages</span>
//         )}
//       </div>
//       <div className="border-1 border-[#27272a] h-fit w-fit rounded-full  flex-1 mx-4">
//         <input
//           className="px-4 py-1 w-full rounded-full"
//           placeholder="Search..."
//         />
//       </div>
//       <div className="flex gap-4 text-[#851de0]">
//         <Phone
//           className={`${
//             selectedConversation ? "cursor-pointer hover:opacity-50" : "hidden"
//           }`}
//           onClick={startAudioCall}
//         />
//         <Video
//           className={`${
//             selectedConversation ? "cursor-pointer hover:opacity-50" : "hidden"
//           }`}
//           onClick={startMeeting}
//         />
//         <Ellipsis className="cursor-pointer hover:opacity-50" />
//       </div>
//     </div>
//   );
// }

// export default Header;

"use client";

import { useConversationStore } from "@/store/useConversationStore";
import { Ellipsis, Phone, Video } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { generateRoomId } from "@/lib/client-utils";
import { useCallStore } from "@/store/useCallStore";
import { messagesArray } from "@/utils/messages";

function Header() {
  // 🧠 Get current user from URL param
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  // 🧠 Zustand state for outgoing call
  const setOutgoingCall = useCallStore((state) => state.setOutgoingCall);

  // 🧠 Zustand state for selected contact
  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );

  // 🧠 Toggle contact options (e.g., menu)
  const toggleShowOptions = useConversationStore(
    (state) => state.toggleShowOptions
  );

  // 🔍 Debug: log selected contact
  // useEffect(() => {
  //   console.log("Selected (via useMemo):", selectedConversation);
  // }, [selectedConversation]);

  // 📞 Start video call using FCM signaling
  const startMeeting = async () => {
    if (!selectedConversation) return;

    const callerInfo = messagesArray.find(
      (msg) => msg.name === participantName
    );
    const callerAvatar = callerInfo?.avatar ?? "";
    const roomName = generateRoomId();

    // 🔐 Get LiveKit connection details
    const res = await fetch(
      `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
    );
    const data = await res.json();

    // 🚀 Send FCM push to callee
    await fetch("/api/send-call-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calleeId: selectedConversation.name,
        callerName: participantName,
        callerAvatar,
        roomName,
        liveKitUrl: data.serverUrl,
        audioOnly: false,
        callerToken: data.participantToken, // ✅ Add this
      }),
    });

    // 🎯 Update Zustand with outgoing call state
    setOutgoingCall({
      calleeName: selectedConversation.name,
      calleeAvatar: selectedConversation.avatar,
      roomName,
      liveKitUrl: data.serverUrl,
      callerToken: data.participantToken,
      callerName: participantName,
      audioOnly: false,
    });

    // ⏱️ Timeout after 30 seconds if unanswered
    setTimeout(() => {
      const currentCall = useCallStore.getState().outgoingCall;
      if (currentCall?.roomName === roomName) {
        console.log("Call timed out — no response");
        useCallStore.getState().clearOutgoingCall();
      }
    }, 30000);
  };

  // 🔊 Start audio-only call using FCM signaling
  const startAudioCall = async () => {
    if (!selectedConversation) return;

    const callerInfo = messagesArray.find(
      (msg) => msg.name === participantName
    );
    const callerAvatar = callerInfo?.avatar ?? "";
    const roomName = generateRoomId();

    const res = await fetch(
      `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
    );
    const data = await res.json();

    await fetch("/api/send-call-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calleeId: selectedConversation.name,
        callerName: participantName,
        callerAvatar,
        roomName,
        liveKitUrl: data.serverUrl,
        audioOnly: true,
        callerToken: data.participantToken, // ✅ Add this
      }),
    });

    setOutgoingCall({
      calleeName: selectedConversation.name,
      calleeAvatar: selectedConversation.avatar,
      roomName,
      liveKitUrl: data.serverUrl,
      callerToken: data.participantToken,
      callerName: participantName,
      audioOnly: true,
    });
    console.log("Outgoing call set:", {
      calleeName: selectedConversation.name,
      callerName: participantName,
    });

    setTimeout(() => {
      const currentCall = useCallStore.getState().outgoingCall;
      if (currentCall?.roomName === roomName) {
        console.log("Audio call timed out — no response");
        useCallStore.getState().clearOutgoingCall();
      }
    }, 30000);
  };

  // 🧠 UI state for search bar
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchText, setSearchText] = useState("");

  return (
    <div className="bg-[#09090b] w-full h-fit px-5 py-3 gap-12 flex text-white items-center border-b border-zinc-800">
      {/* 👤 Contact Info */}
      <div>
        {selectedConversation ? (
          <div className="flex items-center gap-2">
            <Image
              className="w-12 h-12 rounded-full"
              src={selectedConversation.avatar}
              alt=""
            />
            <span>{selectedConversation.name}</span>
          </div>
        ) : (
          <span>Messages</span>
        )}
      </div>

      {/* 🔍 Search Bar */}
      <div className="border-1 border-[#27272a] h-fit w-fit rounded-full flex-1 mx-4">
        <input
          className="px-4 py-1 w-full rounded-full"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* 📞 Call Controls */}
      <div className="flex gap-4 text-[#851de0]">
        <Phone
          className={`${
            selectedConversation ? "cursor-pointer hover:opacity-50" : "hidden"
          }`}
          onClick={startAudioCall}
        />
        <Video
          className={`${
            selectedConversation ? "cursor-pointer hover:opacity-50" : "hidden"
          }`}
          onClick={startMeeting}
        />
        <Ellipsis className="cursor-pointer hover:opacity-50" />
      </div>
    </div>
  );
}

export default Header;
