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
    localStorage.setItem(
      "incomingCall",
      JSON.stringify({
        roomName,
        caller: participantName,
        liveKitUrl: data.serverUrl,
        callerAvatar: selectedConversation.avatar, // 👈 Include avatar
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

  // const { id } = useGlobalSearchParams();

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

        {/* <Suspense fallback="Loading">
          <Tabs>
            <DemoMeetingTab label="Demo" />
            <CustomConnectionTab label="Custom" />
          </Tabs>
        </Suspense> */}
      </div>
    </div>
  );
}

export default Header;
