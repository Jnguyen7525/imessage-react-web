"use client";

import Header from "@/app/components/Header";
import { Message } from "./components/Message";
import { ConversationMessage } from "./components/ConversationMessage";
import { AudioLines, Plus } from "lucide-react";
import { conversationMessages, messagesArray } from "@/utils/messages";
import { useConversationStore } from "@/store/useConversationStore";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useCallStore } from "@/store/useCallStore";
import { IncomingCallPopup } from "./components/IncomingCall";
import { OutgoingCallStatus } from "./components/OutgoingCall";
import CallUIOverlay from "./components/CallUIOverlay";

// function CallUIOverlay() {
//   const incomingCall = useCallStore((s) => s.incomingCall);
//   const outgoingCall = useCallStore((s) => s.outgoingCall);
//   const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const participantName = searchParams.get("user") ?? "anonymous";

//   if (incomingCall) {
//     return (
//       <IncomingCallPopup
//         callerName={incomingCall.callerName}
//         callerAvatar={incomingCall.callerAvatar}
//         onAccept={async () => {
//           const res = await fetch(
//             `/api/connection-details?roomName=${incomingCall.roomName}&participantName=${participantName}`
//           );
//           const data = await res.json();
//           // Notify caller that callee accepted
//           localStorage.setItem("callAccepted", incomingCall.roomName);

//           // router.push(
//           //   `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${incomingCall.roomName}`
//           // );
//           router.push(
//             `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${incomingCall.roomName}&user=${participantName}`
//           );
//           clearIncomingCall();
//         }}
//         onReject={() => {
//           localStorage.setItem("callDeclined", incomingCall.roomName); // 👈 signal rejection

//           clearIncomingCall();
//         }}
//       />
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

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";
  const setIncomingCall = useCallStore((s) => s.setIncomingCall);
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);

  const setSelectedConversation = useConversationStore(
    (state) => state.setSelectedConversation
  );
  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );

  const showOptions = useConversationStore((state) => state.showOptions);

  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(messagesArray);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const handleSearch = () => {
    setMessages(
      messagesArray.filter(
        (message) =>
          message.name.toLowerCase().includes(search.toLowerCase()) ||
          message.message.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const handleSelectMessage = (id: string) => {
    const selected = messagesArray.find((msg) => msg.id === id);
    console.log("Found selected:", selected); // ✅ Should log the object

    setSelectedConversation(selected);
    console.log("Selected conversation (after set):", selectedConversation);
    // router.push(`/message/${id}`);
  };

  useEffect(() => {
    console.log("Selected conversation (after set):", selectedConversation);
  }, [selectedConversation]);

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
  // !this is the clear the outgoing call each time we navigate back to main page so that previous call isn't make again
  useEffect(() => {
    useCallStore.getState().clearOutgoingCall();
  }, []);

  return (
    <div className="font-sans ">
      <main
        className="flex flex-col w-full max-h-screen"
        // data-lk-theme="default"
      >
        <Header />
        {/* <CallUIOverlay />  */}
        {/* 🧱 Split layout below */}
        <div className="flex min-h-0 flex-1 w-full">
          {/* Sidebar / Inbox */}
          <div className="w-[350px] bg-[#09090b] text-white flex flex-col py-5 px-5 border-r border-zinc-800 gap-5">
            {/* Scrollable message list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 gap-5 flex flex-col">
              {messagesArray.map((msg) => (
                <Message
                  key={msg.id}
                  data={msg}
                  onPress={() => handleSelectMessage(msg.id)}
                />
              ))}
            </div>
          </div>
          {/* Conversation Thread */}
          <div className="flex-1 flex flex-col justify-between bg-[#09090b] text-white p-10">
            {selectedConversation ? (
              <>
                <div className="flex flex-col overflow-y-auto scrollbar-hide gap-2">
                  {conversationMessages.map((msg) => (
                    <ConversationMessage key={msg.id} data={msg} />
                  ))}
                </div>

                <div className="flex sticky bottom-0 mt-5">
                  <div className="flex w-full items-center ">
                    {/* Audio icon (left) */}
                    <button className="">
                      <Plus
                        size={24}
                        color={"#851de0"}
                        className="cursor-pointer hover:opacity-50"
                      />
                    </button>

                    {/* Input field (center) */}
                    <div className="flex items-center justify-between flex-1 mx-2 border border-zinc-800 rounded-full px-5 py-1">
                      <input
                        className="w-full rounded-full outline-none"
                        // placeholderTextColor={colors.zinc[400]}
                        placeholder="Message"
                      />
                      {/* Plus icon (right) */}
                      <button className="">
                        <AudioLines
                          size={24}
                          color={"#851de0"}
                          className="cursor-pointer hover:opacity-50"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 bg-[#09090b] text-white flex items-center justify-center h-full">
                <p className="">Please select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
