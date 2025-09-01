"use client";

import { useState } from "react";
import { messagesArray } from "@/utils/messages";

import { Video } from "lucide-react";
import { useConversationStore } from "@/store/useConversationStore";
import { useCallStore } from "@/store/useCallStore";
import { generateRoomId } from "@/lib/client-utils";
import { Message } from "./Message";

export default function SidebarCallerPanel({
  participantName,
}: {
  participantName: string;
}) {
  const [open, setOpen] = useState(true);
  const setSelectedConversation = useConversationStore(
    (s) => s.setSelectedConversation
  );
  const setOutgoingCall = useCallStore((s) => s.setOutgoingCall);

  const handleCall = async (msg: any) => {
    const roomName = generateRoomId();
    const res = await fetch(
      `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
    );
    const data = await res.json();

    localStorage.setItem(
      "incomingCall",
      JSON.stringify({
        roomName,
        caller: participantName,
        liveKitUrl: data.serverUrl,
        callerAvatar: msg.avatar,
      })
    );

    setOutgoingCall({
      calleeName: msg.name,
      calleeAvatar: msg.avatar,
      roomName,
      liveKitUrl: data.serverUrl,
      callerToken: data.participantToken,
    });
  };

  return (
    <div
      className={`absolute top-0 left-0 h-full bg-[#09090b] text-white transition-all duration-300 ${
        open ? "w-[350px]" : "w-0 overflow-hidden"
      } z-50`}
    >
      <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800">
        <span className="text-lg font-semibold">Contacts</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-zinc-400 hover:text-white"
        >
          {open ? "Close" : "Open"}
        </button>
      </div>
      <div className="flex flex-col gap-4 px-4 py-4 overflow-y-auto scrollbar-hide">
        {messagesArray.map((msg) => (
          <div key={msg.id} className="flex items-center justify-between">
            <Message data={msg} onPress={() => setSelectedConversation(msg)} />
            <Video
              className="w-5 h-5 text-[#851de0] cursor-pointer hover:opacity-50"
              onClick={() => handleCall(msg)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
