"use client";

import Header from "@/app/components/Header";
import Image from "next/image";
import { Message } from "./components/Message";
import { ConversationMessage } from "./components/ConversationMessage";
import { AudioLines, Plus } from "lucide-react";
import { conversationMessages, messagesArray } from "@/utils/messages";
import { useConversationStore } from "@/store/useConversationStore";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import {
  encodePassphrase,
  generateRoomId,
  randomString,
} from "@/lib/client-utils";
import styles from "../styles/Home.module.css";
import { useCallStore } from "@/store/useCallStore";
import { IncomingCallPopup } from "./components/IncomingCall";
import { OutgoingCallStatus } from "./components/OutgoingCall";

function Tabs(props: React.PropsWithChildren<{}>) {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get("tab") === "custom" ? 1 : 0;

  const router = useRouter();
  function onTabSelected(index: number) {
    const tab = index === 1 ? "custom" : "demo";
    router.push(`/?tab=${tab}`);
  }

  let tabs = React.Children.map(props.children, (child, index) => {
    return (
      <button
        className="lk-button"
        onClick={() => {
          if (onTabSelected) {
            onTabSelected(index);
          }
        }}
        aria-pressed={tabIndex === index}
      >
        {/* @ts-ignore */}
        {child?.props.label}
      </button>
    );
  });

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabSelect}>{tabs}</div>
      {/* @ts-ignore */}
      {props.children[tabIndex]}
    </div>
  );
}

function DemoMeetingTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const startMeeting = () => {
    if (e2ee) {
      router.push(
        `/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`
      );
    } else {
      router.push(`/rooms/${generateRoomId()}`);
    }
  };
  return (
    <div className={styles.tabContent}>
      <p style={{ margin: 0 }}>
        Try LiveKit Meet for free with our live demo project.
      </p>
      <button
        style={{ marginTop: "1rem" }}
        className="lk-button"
        onClick={startMeeting}
      >
        Start Meeting
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
          ></input>
          <label htmlFor="use-e2ee">Enable end-to-end encryption</label>
        </div>
        {e2ee && (
          <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            <label htmlFor="passphrase">Passphrase</label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CustomConnectionTab(props: { label: string }) {
  const router = useRouter();

  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const serverUrl = formData.get("serverUrl");
    const token = formData.get("token");
    if (e2ee) {
      router.push(
        `/custom/?liveKitUrl=${serverUrl}&token=${token}#${encodePassphrase(
          sharedPassphrase
        )}`
      );
    } else {
      router.push(`/custom/?liveKitUrl=${serverUrl}&token=${token}`);
    }
  };
  return (
    <form className={styles.tabContent} onSubmit={onSubmit}>
      <p style={{ marginTop: 0 }}>
        Connect LiveKit Meet with a custom server using LiveKit Cloud or LiveKit
        Server.
      </p>
      <input
        id="serverUrl"
        name="serverUrl"
        type="url"
        placeholder="LiveKit Server URL: wss://*.livekit.cloud"
        required
      />
      <textarea
        id="token"
        name="token"
        placeholder="Token"
        required
        rows={5}
        style={{
          padding: "1px 2px",
          fontSize: "inherit",
          lineHeight: "inherit",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
          ></input>
          <label htmlFor="use-e2ee">Enable end-to-end encryption</label>
        </div>
        {e2ee && (
          <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            <label htmlFor="passphrase">Passphrase</label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
            />
          </div>
        )}
      </div>

      <hr
        style={{
          width: "100%",
          borderColor: "rgba(255, 255, 255, 0.15)",
          marginBlock: "1rem",
        }}
      />
      <button
        style={{ paddingInline: "1.25rem", width: "100%" }}
        className="lk-button"
        type="submit"
      >
        Connect
      </button>
    </form>
  );
}

function CallUIOverlay() {
  const incomingCall = useCallStore((s) => s.incomingCall);
  const outgoingCall = useCallStore((s) => s.outgoingCall);
  const clearIncomingCall = useCallStore((s) => s.clearIncomingCall);
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  if (incomingCall) {
    return (
      <IncomingCallPopup
        callerName={incomingCall.callerName}
        callerAvatar={incomingCall.callerAvatar}
        onAccept={async () => {
          const res = await fetch(
            `/api/connection-details?roomName=${incomingCall.roomName}&participantName=${participantName}`
          );
          const data = await res.json();
          // Notify caller that callee accepted
          localStorage.setItem("callAccepted", incomingCall.roomName);

          router.push(
            `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${incomingCall.roomName}`
          );
          clearIncomingCall();
        }}
        onReject={() => {
          localStorage.setItem("callDeclined", incomingCall.roomName); // 👈 signal rejection

          clearIncomingCall();
        }}
      />
    );
  }

  if (outgoingCall) {
    return (
      <OutgoingCallStatus
        calleeName={outgoingCall.calleeName}
        calleeAvatar={outgoingCall.calleeAvatar}
      />
    );
  }

  return null;
}

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

  // React.useEffect(() => {
  //   console.log("Selected conversation:", selectedConversation);
  // }, [selectedConversation]);

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

  // useEffect(() => {
  //   const checkIncomingCall = async () => {
  //     const callData = localStorage.getItem("incomingCall");
  //     if (callData) {
  //       const { roomName, caller, liveKitUrl } = JSON.parse(callData);
  //       const accept = confirm(`${caller} is calling you. Accept?`);

  //       if (accept) {
  //         // Fetch a new token for the current user (callee)
  //         const res = await fetch(
  //           `/api/connection-details?roomName=${roomName}&participantName=${participantName}`
  //         );
  //         const data = await res.json();

  //         router.push(
  //           `/custom/?liveKitUrl=${data.serverUrl}&token=${data.participantToken}&roomName=${roomName}`
  //         );
  //       }

  //       localStorage.removeItem("incomingCall");
  //     }
  //   };

  //   window.addEventListener("focus", checkIncomingCall);
  //   return () => window.removeEventListener("focus", checkIncomingCall);
  // }, [participantName, router, searchParams]);

  // this is for listening for incoming calls to accept joining a room on the callee side
  useEffect(() => {
    const checkIncomingCall = () => {
      const callData = localStorage.getItem("incomingCall");
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

        localStorage.removeItem("incomingCall");
      }
    };

    window.addEventListener("focus", checkIncomingCall);
    return () => window.removeEventListener("focus", checkIncomingCall);
  }, [participantName, setIncomingCall, clearIncomingCall, router]);

  // this is listening for when callee accepts the outgoing call to joing the room on the caller side
  useEffect(() => {
    const checkCallAccepted = () => {
      const acceptedRoom = localStorage.getItem("callAccepted");
      const outgoingCall = useCallStore.getState().outgoingCall;

      if (acceptedRoom && outgoingCall?.roomName === acceptedRoom) {
        router.push(
          `/custom/?liveKitUrl=${outgoingCall.liveKitUrl}&token=${outgoingCall.callerToken}&roomName=${outgoingCall.roomName}`
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
        alert(`${outgoingCall.calleeName} declined the call`);
        useCallStore.getState().clearOutgoingCall();
        localStorage.removeItem("callDeclined");
      }
    };

    window.addEventListener("focus", checkCallDeclined);
    return () => window.removeEventListener("focus", checkCallDeclined);
  }, []);

  return (
    <div className="font-sans ">
      <main
        className="flex flex-col w-full max-h-screen"
        // data-lk-theme="default"
      >
        <Header />
        <CallUIOverlay /> {/* 👈 Add this here */}
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
                {/* <div className="">{selectedConversation.name}</div> */}
                {/* {conversationMessages.map((msg) => (
                  <ConversationMessage key={msg.id} data={msg} />
                ))} */}
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
                {/* <Suspense fallback="Loading">
                  <Tabs>
                    <DemoMeetingTab label="Demo" />
                    <CustomConnectionTab label="Custom" />
                  </Tabs>
                </Suspense> */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
