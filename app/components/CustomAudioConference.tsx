"use client";

import {
  useParticipants,
  ConnectionStateToast,
  Chat,
  useRoomContext,
  useTracks,
  // Track,
  ControlBar,
} from "@livekit/components-react";
import { useSearchParams } from "next/navigation";
import { useCallStore } from "@/store/useCallStore";
import Image from "next/image";
import toast from "react-hot-toast";
import { useState } from "react";
import { messagesArray } from "@/utils/messages";
import { Phone, UserMinus2, EllipsisVertical } from "lucide-react";

export function CustomAudioConference({
  participantName,
}: {
  participantName: string;
}) {
  const room = useRoomContext();
  const participants = useParticipants();
  const searchParams = useSearchParams();
  const roomName = searchParams.get("roomName") ?? "Unknown";

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "contacts" | "participants" | "rooms"
  >("contacts");

  const handleRemoveParticipant = async (identity: string) => {
    try {
      const res = await fetch("/api/kick-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantIdentity: identity }),
      });

      const result = await res.json();
      result.success
        ? toast.success(`Removed ${identity}`)
        : toast.error("Failed to remove participant");
    } catch {
      toast.error("Error removing participant");
    }
  };

  const handleUpgradeToVideo = async () => {
    try {
      await room.localParticipant.setCameraEnabled(true);
      setCameraEnabled(true);
    } catch {
      toast.error("Failed to enable camera");
    }
  };

  return (
    <div className="lk-video-conference-inner flex h-full bg-[#09090b] text-white">
      {/* 🟣 Sidebar */}
      <div
        className={`flex-shrink-0 transition-all duration-300 shadow-lg overflow-y-auto ${
          sidebarOpen ? "w-[300px] p-4" : "w-0 p-0"
        }`}
      >
        <div className={`${sidebarOpen ? "block" : "hidden"}`}>
          <div className="flex justify-between mb-4">
            {["contacts", "participants", "rooms"].map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1 rounded-lg cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#851de0] text-white"
                    : "bg-zinc-800 text-zinc-400"
                } hover:bg-zinc-700`}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <ul className="space-y-3">
              {messagesArray.map((msg) => (
                <li
                  key={msg.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    {msg.avatar ? (
                      <Image
                        src={msg.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm">
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{msg.name}</span>
                  </div>
                  <button
                    className="text-[#851de0] hover:opacity-70 cursor-pointer"
                    onClick={async () => {
                      const res = await fetch(
                        `/api/connection-details?roomName=${roomName}&participantName=${msg.name}`
                      );
                      const data = await res.json();

                      const callerInfo = messagesArray.find(
                        (m) => m.name === participantName
                      );
                      const callerAvatar = callerInfo?.avatar ?? "";

                      localStorage.setItem(
                        `incomingCall-${msg.name}`,
                        JSON.stringify({
                          roomName,
                          caller: participantName,
                          liveKitUrl: data.serverUrl,
                          callerAvatar,
                        })
                      );

                      useCallStore.getState().setOutgoingCall({
                        calleeName: msg.name,
                        calleeAvatar: msg.avatar,
                        roomName,
                        liveKitUrl: data.serverUrl,
                        callerToken: data.participantToken,
                        callerName: participantName,
                      });

                      setTimeout(() => {
                        const currentCall =
                          useCallStore.getState().outgoingCall;
                        const acceptedRoom = localStorage.getItem(
                          `callAccepted-${participantName}`
                        );

                        if (
                          currentCall?.roomName === roomName &&
                          acceptedRoom !== roomName
                        ) {
                          alert(`${msg.name} did not respond — call timed out`);
                          useCallStore.getState().clearOutgoingCall();
                        }
                      }, 30000);
                    }}
                  >
                    <Phone size={22} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Participants Tab */}
          {activeTab === "participants" && (
            <ul className="space-y-3">
              {participants.map((p) => {
                const displayName = p.name ?? p.identity;
                const matchedMessage = messagesArray.find(
                  (msg) => msg.name === displayName
                );
                const avatar = matchedMessage?.avatar;

                return (
                  <li
                    key={p.identity}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{displayName}</span>
                    </div>
                    <button
                      className="text-red-500 hover:opacity-70 cursor-pointer"
                      onClick={() => handleRemoveParticipant(p.identity)}
                    >
                      <UserMinus2 size={22} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Rooms Tab */}
          {activeTab === "rooms" && (
            <ul className="space-y-3">
              <li className="font-semibold">Current Room: {room.name}</li>
              {["Team Sync", "Design Review", "Dev Standup"].map((roomName) => (
                <li
                  key={roomName}
                  className="flex justify-between items-center"
                >
                  <span>{roomName}</span>
                  <button className="text-[#851de0] hover:opacity-70 text-sm">
                    Join
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 🟢 Main conference area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-4">
        <h2 className="text-xl font-bold mb-4">Audio Conference</h2>

        {!cameraEnabled && (
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 mb-4"
            onClick={handleUpgradeToVideo}
          >
            Upgrade to Video
          </button>
        )}

        {cameraEnabled ? (
          <div className="text-white mt-4">
            <h2 className="text-xl font-bold mb-4">Video Enabled</h2>
            <p>Your camera is now active. Video tiles would appear here.</p>
            {/* Optional: render <CustomVideoConference /> here if you want full layout */}
          </div>
        ) : (
          <ul className="space-y-3">
            {participants.map((p) => {
              const displayName = p.name ?? p.identity;
              const isSpeaking = p.isSpeaking;

              return (
                <li
                  key={p.identity}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span>{displayName}</span>
                    {isSpeaking && (
                      <span className="text-green-500 ml-2">Speaking</span>
                    )}
                  </div>
                  <button
                    className="text-red-500 hover:opacity-70"
                    onClick={() => handleRemoveParticipant(p.identity)}
                  >
                    Kick
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Control bar + toggle */}
        <div className="flex items-center justify-center text-sm mt-4">
          <button
            className="bg-zinc-800 text-white h-[36px] md:h-[44px] px-2 hover:bg-zinc-700 rounded-lg cursor-pointer"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <EllipsisVertical />
          </button>
          <ControlBar
            variation="minimal"
            controls={{ chat: true, settings: true }}
          />
        </div>
      </div>

      {/* Chat and connection state */}
      <Chat style={{ marginTop: "2rem" }} />
      <ConnectionStateToast />
    </div>
  );
}
