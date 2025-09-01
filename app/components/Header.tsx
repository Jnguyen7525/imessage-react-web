"use client";

import { useConversationStore } from "@/store/useConversationStore";
import { Ellipsis, Phone, Video } from "lucide-react";
import Image from "next/image";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import {
  encodePassphrase,
  generateRoomId,
  randomString,
} from "@/lib/client-utils";
import styles from "@/styles/Home.module.css";
import { useCallStore } from "@/store/useCallStore";

function Header() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  const setOutgoingCall = useCallStore((state) => state.setOutgoingCall);
  const clearOutgoingCall = useCallStore((state) => state.clearOutgoingCall);

  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  // const startMeeting = () => {
  //   if (e2ee) {
  //     router.push(
  //       `/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`
  //     );
  //   } else {
  //     router.push(`/rooms/${generateRoomId()}`);
  //   }
  // };
  // !first try with custom folder
  // const startMeeting = async () => {
  //   const roomName = generateRoomId();

  //   const res = await fetch(
  //     `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
  //   );
  //   const data = await res.json();

  //   // Send call invite to other user (via localStorage for now)
  //   localStorage.setItem(
  //     "incomingCall",
  //     JSON.stringify({
  //       roomName,
  //       caller: participantName,
  //       liveKitUrl: data.serverUrl,
  //       // token: data.participantToken,
  //     })
  //   );

  //   router.push(
  //     `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${roomName}`
  //   );
  // };
  // !second try now with callinguioverlay
  const startMeeting = async () => {
    if (!selectedConversation) return;

    const roomName = generateRoomId();

    const res = await fetch(
      `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
    );
    const data = await res.json();

    // Simulate signaling via localStorage
    // localStorage.setItem(
    //   "incomingCall",
    //   JSON.stringify({
    //     roomName,
    //     caller: participantName,
    //     liveKitUrl: data.serverUrl,
    //     callerAvatar: selectedConversation.avatar, // 👈 Include avatar
    //   })
    // );
    localStorage.setItem(
      `incomingCall-${selectedConversation.name}`,
      JSON.stringify({
        roomName,
        caller: participantName,
        liveKitUrl: data.serverUrl,
        callerAvatar: selectedConversation.avatar,
      })
    );

    // Show "Calling..." UI
    // setOutgoingCall({
    //   calleeName: selectedConversation.name,
    //   calleeAvatar: selectedConversation.avatar,
    // });
    setOutgoingCall({
      calleeName: selectedConversation.name,
      calleeAvatar: selectedConversation.avatar,
      roomName,
      liveKitUrl: data.serverUrl,
      callerToken: data.participantToken, // 👈 store caller’s token
    });

    // Optional: clear after 30 seconds
    // setTimeout(() => {
    //   clearOutgoingCall();
    // }, 30000);
    // ⏱️ Timeout after 30 seconds if unanswered
    setTimeout(() => {
      const currentCall = useCallStore.getState().outgoingCall;
      const acceptedRoom = localStorage.getItem("callAccepted");

      if (currentCall?.roomName === roomName && acceptedRoom !== roomName) {
        alert("Call timed out — no response");
        useCallStore.getState().clearOutgoingCall();
      }
    }, 30000);

    // !took this out because it was causing us to immediately join the room after clicking the call button. we want to wait until the callee accepts first
    // router.push(
    //   `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${roomName}`
    // );
  };

  const toggleShowOptions = useConversationStore(
    (state) => state.toggleShowOptions
  );

  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");

  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );

  // Optional debug
  React.useEffect(() => {
    console.log("Selected (via useMemo):", selectedConversation);
  }, [selectedConversation]);
  return (
    <div className="bg-[#09090b] w-full h-fit px-5 py-3 gap-12 flex text-white items-center border-b border-zinc-800">
      <div className="">
        {selectedConversation ? (
          <div className="flex items-center gap-2">
            <Image
              className="w-12 h-12 rounded-full"
              src={selectedConversation.avatar}
              alt=""
            />
            <span className="">{selectedConversation.name}</span>
          </div>
        ) : (
          <span className="">Messages</span>
        )}
      </div>
      <div className="border-1 border-[#27272a] h-fit w-fit rounded-full  flex-1 mx-4">
        <input
          className="px-4 py-1 w-full rounded-full"
          placeholder="Search..."
        />
      </div>
      <div className="flex gap-4 text-[#851de0]">
        <Phone
          className={`${
            selectedConversation ? "cursor-pointer hover:opacity-50" : "hidden"
          }`}
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
