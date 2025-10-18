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
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { generateRoomId } from "@/lib/client-utils";
import { useCallStore } from "@/store/useCallStore";
import { messagesArray } from "@/utils/messages";
import Link from "next/link";
import { LOGIN_PATH, SIGNUP_PATH } from "../constants/common";
import createClient from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const userName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User";
  const userAvatar = user?.user_metadata?.avatar_url ?? null;

  // 🧠 Get current user from URL param
  const searchParams = useSearchParams();
  // const participantName = searchParams.get("user") ?? "anonymous";
  const participantName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "anonymous";

  const participantAvatar = user?.user_metadata?.avatar_url ?? "";

  const pathname = usePathname();
  const isInbox = pathname === "/";
  const isLogin = pathname === "/login";
  const isSignup = pathname === "/signup";

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

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 🔍 Debug: log selected contact
  // useEffect(() => {
  //   console.log("Selected (via useMemo):", selectedConversation);
  // }, [selectedConversation]);

  // 📞 Start video call using FCM signaling
  const startMeeting = async () => {
    if (!selectedConversation) return;

    // const callerInfo = messagesArray.find(
    //   (msg) => msg.name === participantName
    // );
    // const callerAvatar = callerInfo?.avatar ?? "";
    const callerAvatar = participantAvatar;

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
    <div className="bg-[#09090b] w-full h-fit px-5 py-3 gap-12 flex text-white items-center border-b border-zinc-800 justify-between">
      <div>
        {isLogin ? (
          <Link href="/">Login</Link>
        ) : isSignup ? (
          <Link href="/">Signup</Link>
        ) : selectedConversation ? (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Image
              className="w-12 h-12 rounded-full"
              src={selectedConversation.avatar}
              alt=""
            />
            <span>{selectedConversation.name}</span>
          </Link>
        ) : (
          <Link href="/" className="hover:opacity-80">
            Messages
          </Link>
        )}
      </div>

      {/* 🔍 Search Bar */}
      {isInbox && (
        <div className="border-1 border-[#27272a] h-fit w-fit rounded-full flex-1 mx-4">
          <input
            className="px-4 py-1 w-full rounded-full"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      )}
      {/* 📞 Call Controls */}
      <div className="flex gap-4 text-[#851de0] relative">
        {isInbox && selectedConversation && (
          <>
            <Phone
              className="cursor-pointer hover:opacity-50"
              onClick={startAudioCall}
            />
            <Video
              className="cursor-pointer hover:opacity-50"
              onClick={startMeeting}
            />
          </>
        )}

        <Ellipsis
          className="cursor-pointer hover:opacity-50"
          onClick={() => setShowDropdown((prev) => !prev)}
        />

        {showDropdown && (
          <div
            className="absolute right-0 top-10 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg p-2 z-50 w-40"
            ref={dropdownRef}
          >
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={userName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm">{userName}</span>
                </div>

                <Link href="/profile" className="hover:text-purple-500">
                  Profile
                </Link>

                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    window.location.href = "/auth/login"; // or use router.push if preferred
                  }}
                  className="block px-4 py-2 hover:bg-zinc-800 rounded text-left w-full"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href={LOGIN_PATH}
                  className="block px-4 py-2 hover:bg-zinc-800 rounded"
                >
                  Login
                </Link>
                <Link
                  href={SIGNUP_PATH}
                  className="block px-4 py-2 hover:bg-zinc-800 rounded"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
