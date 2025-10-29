"use client";

import { useConversationStore } from "@/store/useConversationStore";
import { Ellipsis, Phone, Smartphone, Video } from "lucide-react";
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

function ChatTopBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const userName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "User";
  const userAvatar =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;

  // 🧠 Get current user from URL param
  const searchParams = useSearchParams();

  // const participantName = searchParams.get("user") ?? "anonymous";
  const participantName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "anonymous";

  const participantAvatar =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;

  const pathname = usePathname();
  const isInbox = pathname === "/";
  const isLogin = pathname === "/login";
  const isSignup = pathname === "/signup";

  // 🧠 Zustand state for outgoing call
  const setOutgoingCall = useCallStore((state) => state.setOutgoingCall);

  const { showPhone, setShowPhone } = useConversationStore();

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
    const callerAvatar = participantAvatar ?? "";

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
        // calleeId: selectedConversation.name,
        calleeId: selectedConversation.contact.id, // ✅ use Supabase user ID
        callerId: user?.id, // ✅ use Supabase user ID
        callerName: participantName,
        callerAvatar,
        roomName,
        liveKitUrl: data.serverUrl,
        audioOnly: false,
        callerToken: data.participantToken, // ✅ Add this
      }),
    });

    setOutgoingCall({
      calleeName: selectedConversation.contact.name,
      calleeId: selectedConversation.contact.id,
      calleeAvatar:
        selectedConversation.contact.avatar ??
        selectedConversation.contact.name.toUpperCase().charAt(0),
      roomName,
      liveKitUrl: data.serverUrl,
      callerToken: data.participantToken,
      callerName: participantName,
      audioOnly: false,
    });
    console.log("Outgoing call set:", {
      calleeName: selectedConversation.contact.name,
      calleeId: selectedConversation.contact.id,
      callerName: participantName,
      callerId: user?.id,
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

    // const callerInfo = messagesArray.find(
    //   (msg) => msg.name === participantName
    // );
    // const callerAvatar = callerInfo?.avatar ?? "";
    const callerAvatar = participantAvatar ?? ``;

    const roomName = generateRoomId();

    const res = await fetch(
      `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
    );
    const data = await res.json();

    await fetch("/api/send-call-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // calleeId: selectedConversation.name,
        calleeId: selectedConversation.contact.id, // ✅ use Supabase user ID
        callerId: user?.id, // ✅ use Supabase user ID
        callerName: participantName,
        callerAvatar,
        roomName,
        liveKitUrl: data.serverUrl,
        audioOnly: true,
        callerToken: data.participantToken, // ✅ Add this
      }),
    });

    setOutgoingCall({
      calleeName: selectedConversation.contact.name,
      calleeId: selectedConversation.contact.id,
      calleeAvatar:
        selectedConversation.contact.avatar ??
        selectedConversation.contact.name.toUpperCase().charAt(0),
      roomName,
      liveKitUrl: data.serverUrl,
      callerToken: data.participantToken,
      callerName: participantName,
      audioOnly: true,
    });
    console.log("Outgoing call set:", {
      calleeName: selectedConversation.contact.name,
      calleeId: selectedConversation.contact.id,
      callerName: participantName,
      callerId: user?.id,
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
    <div className="bg-gradient-to-t from-slate-800 to-slate-950 w-full h-fit px-5 py-3 gap-12 flex text-white items-center border-b border-zinc-800 justify-between">
      <div>
        {isLogin ? (
          <Link href="/">Login</Link>
        ) : isSignup ? (
          <Link href="/">Signup</Link>
        ) : selectedConversation ? (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            {selectedConversation.contact.avatar ? (
              <Image
                className="w-12 h-12 rounded-full"
                src={selectedConversation.contact.avatar}
                alt=""
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                {selectedConversation.contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span>{selectedConversation.contact.name}</span>
          </Link>
        ) : (
          <Link href="/" className="hover:opacity-80">
            Messages
          </Link>
        )}
      </div>

      {/* 🔍 Search Bar */}
      {isInbox && (
        <div className="border-1 bg-slate-900 border-slate-600 h-fit w-fit rounded-full flex-1 mx-4">
          <input
            className="px-4 py-1 w-full rounded-full"
            placeholder="Search This Chat..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      )}
      {/* 📞 Call Controls */}
      <div className="flex gap-4 text-white relative">
        {isInbox && selectedConversation && (
          <>
            <Smartphone
              className={`${
                showPhone ? " scale-125 text-blue-500" : "opacity-100"
              } cursor-pointer hover:opacity-50`}
              onClick={() => setShowPhone(!showPhone)}
            />
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
            className="absolute -right-4 top-12 bg-zinc-950 border border-zinc-700 rounded-md shadow-lg p-5 z-50 w-50"
            ref={dropdownRef}
          >
            <div className="flex flex-col items-start gap-2">
              <div className="flex w-full justify-center items-center gap-2 cursor-pointer hover:opacity-50">
                {selectedConversation?.contact.avatar ? (
                  <Image
                    src={selectedConversation.contact.avatar}
                    alt={selectedConversation?.contact.name}
                    width={40}
                    height={40}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center font-bold">
                    {selectedConversation?.contact.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="">{selectedConversation?.contact.name}</span>
              </div>

              <Link href="/profile" className="hover:opacity-50">
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatTopBar;
