// import type {
//   MessageDecoder,
//   MessageEncoder,
//   TrackReferenceOrPlaceholder,
//   WidgetState,
// } from "@livekit/components-core";
// import {
//   isEqualTrackRef,
//   isTrackReference,
//   isWeb,
//   log,
// } from "@livekit/components-core";
// import { RoomEvent, Track } from "livekit-client";
// import * as React from "react";
// import type { MessageFormatter } from "../components";
// import {
//   CarouselLayout,
//   ConnectionStateToast,
//   FocusLayout,
//   FocusLayoutContainer,
//   GridLayout,
//   LayoutContextProvider,
//   ParticipantTile,
//   RoomAudioRenderer,
// } from "../components";
// import { useCreateLayoutContext } from "../context";
// import { usePinnedTracks, useTracks } from "../hooks";
// import { Chat } from "./Chat";
// import { ControlBar } from "./ControlBar";
// import { useWarnAboutMissingStyles } from "../hooks/useWarnAboutMissingStyles";

import { useCallStore } from "@/store/useCallStore";
import { messagesArray } from "@/utils/messages";
import {
  isEqualTrackRef,
  isTrackReference,
  isWeb,
  log,
  MessageDecoder,
  MessageEncoder,
  TrackReference,
} from "@livekit/components-core";
import {
  CarouselLayout,
  Chat,
  ConnectionStateToast,
  ControlBar,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  type MessageFormatter,
  ParticipantAudioTile,
  ParticipantLoop,
  ParticipantName,
  ParticipantTile,
  RoomAudioRenderer,
  TrackReferenceOrPlaceholder,
  useCreateLayoutContext,
  useParticipants,
  useParticipantTile,
  usePinnedTracks,
  useRoomContext,
  useTracks,
  WidgetState,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import { EllipsisVertical, Phone, UserMinus2, Volume2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import { CustomParticipantTile } from "./CustomParticipantTile";
import { useRoomBridgeStore } from "@/store/useRoomBridgeStore";

function CustomAudioTile({ trackRef }: { trackRef: TrackReference }) {
  const elementProps = useParticipantTile({
    trackRef,
    htmlProps: {},
  }).elementProps;

  const participant = trackRef.participant;
  const displayName = participant.name ?? participant.identity;
  const matchedMessage = messagesArray.find((msg) => msg.name === displayName);
  const avatar = matchedMessage?.avatar;

  return (
    <div
      {...elementProps}
      className="flex flex-col items-center justify-center border border-gray-700 rounded-lg p-4 bg-zinc-900 text-white"
    >
      <div className="relative">
        {avatar ? (
          <Image
            src={avatar}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xl">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <Volume2
          size={20}
          className={`absolute top-0 right-0 ${
            participant.isSpeaking
              ? "text-green-400 animate-pulse"
              : "text-zinc-400"
          } bg-zinc-800 rounded-full p-1`}
        />
      </div>
      <span className="mt-2 text-sm font-medium">{displayName}</span>
    </div>
  );
}

/**
 * @public
 */
export interface VideoConferenceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  cameraEnabled?: boolean;

  chatMessageFormatter?: MessageFormatter;
  chatMessageEncoder?: MessageEncoder;
  chatMessageDecoder?: MessageDecoder;
  /** @alpha */
  SettingsComponent?: React.ComponentType;
}

/**
 * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
 * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
 * of participants, basic non-persistent chat, screen sharing, and more.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 * You can use these components as a starting point for your own custom video conferencing application.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 * @public
 */
export function CustomVideoConference({
  cameraEnabled = true, // ✅ default to video

  chatMessageFormatter,
  chatMessageDecoder,
  chatMessageEncoder,
  SettingsComponent,
  ...props
}: VideoConferenceProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    "contacts" | "participants" | "rooms"
  >("contacts");
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const router = useRouter();

  const room = useRoomContext();
  useRoomBridgeStore.getState().setRoom(room);


  const participants = useParticipants();
  const roomName = room.name;
  const searchParams = useSearchParams();
  const liveKitUrl = searchParams.get("liveKitUrl");
  const participantName = searchParams.get("user") ?? "anonymous";
  const audioOnly = searchParams.get("audioOnly") === "true";

  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });
  const lastAutoFocusedScreenShareTrack =
    React.useRef<TrackReferenceOrPlaceholder | null>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false }
  );

  const widgetUpdate = (state: WidgetState) => {
    log.debug("updating widget state", state);
    setWidgetState(state);
  };

  const layoutContext = useCreateLayoutContext();

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter(
    (track) => !isEqualTrackRef(track, focusTrack)
  );

  React.useEffect(() => {
    // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      log.debug("Auto set screen share focus:", {
        newScreenShareTrack: screenShareTracks[0],
      });
      layoutContext.pin.dispatch?.({
        msg: "set_pin",
        trackReference: screenShareTracks[0],
      });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid
      )
    ) {
      log.debug("Auto clearing screen share focus.");
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusedScreenShareTrack.current = null;
    }
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updatedFocusTrack = tracks.find(
        (tr) =>
          tr.participant.identity === focusTrack.participant.identity &&
          tr.source === focusTrack.source
      );
      if (
        updatedFocusTrack !== focusTrack &&
        isTrackReference(updatedFocusTrack)
      ) {
        layoutContext.pin.dispatch?.({
          msg: "set_pin",
          trackReference: updatedFocusTrack,
        });
      }
    }
  }, [
    screenShareTracks
      .map(
        (ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`
      )
      .join(),
    focusTrack?.publication?.trackSid,
    tracks,
  ]);

  const handleRemoveParticipant = async (identity: string) => {
    const roomName = room.name; // or get from URL/query param

    try {
      const res = await fetch("/api/kick-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantIdentity: identity }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`Removed ${identity} from the room`);
      } else {
        toast.error("Failed to remove participant");
      }
    } catch (err) {
      toast.error("Error removing participant");
    }
  };

  React.useEffect(() => {
    const onDisconnect = () => {
      toast("You’ve been removed from the room", { icon: "🚫" });
      // router.push("/"); // ✅ Send user back to inbox or main view
      router.push(`/?user=${encodeURIComponent(participantName)}`);
    };

    room.on(RoomEvent.Disconnected, onDisconnect);

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnect);
    };
  }, [room]);

  React.useEffect(() => {
    return () => {
      useCallStore.getState().clearOutgoingCall();
    };
  }, []);

  //   useWarnAboutMissingStyles();

  React.useEffect(() => {
    if (cameraEnabled === false) {
      room.localParticipant.setCameraEnabled(false).catch(() => {
        toast.error("Failed to disable camera");
      });
    }
  }, [cameraEnabled, room]);

  return (
    <div className="lk-video-conference " {...props}>
      {isWeb() && (
        <LayoutContextProvider
          value={layoutContext}
          onWidgetChange={widgetUpdate}
        >
          <div className="lk-video-conference-inner flex">
            <div className="flex-1 flex overflow-hidden">
              {/* 🟣 Sidebar */}
              <div
                className={`flex-shrink-0 transition-all duration-300 bg-[#09090b] text-white shadow-lg overflow-y-auto ${
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

                              if (
                                !participantName ||
                                participantName === "anonymous"
                              ) {
                                console.warn(
                                  "Caller name is missing or defaulted to anonymous"
                                );
                              }

                              localStorage.setItem(
                                `incomingCall-${msg.name}`,
                                JSON.stringify({
                                  roomName,
                                  caller: participantName,
                                  liveKitUrl: data.serverUrl,
                                  callerAvatar, // ✅ now using the correct avatar
                                  audioOnly, // ✅ propagate the flag
                                })
                              );

                              useCallStore.getState().setOutgoingCall({
                                calleeName: msg.name,
                                calleeAvatar: msg.avatar,
                                roomName,
                                liveKitUrl: data.serverUrl,
                                callerToken: data.participantToken,
                                callerName: participantName, // 👈 add this
                                audioOnly, // ✅ pass to UI logic
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
                                  alert(
                                    `${msg.name} did not respond — call timed out`
                                  );
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

                        // 🔍 Inline lookup from messagesArray
                        const matchedMessage = messagesArray.find(
                          (msg) => msg.name === displayName
                        );
                        const avatar = matchedMessage?.avatar;
                        console.log(`Avatar for ${displayName}:`, avatar);

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
                              onClick={() =>
                                handleRemoveParticipant(p.identity)
                              }
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
                      <li className="font-semibold">
                        Current Room: {room.name}
                      </li>
                      {/* Replace with actual room list if available */}
                      {["Team Sync", "Design Review", "Dev Standup"].map(
                        (roomName) => (
                          <li
                            key={roomName}
                            className="flex justify-between items-center"
                          >
                            <span>{roomName}</span>
                            <button className="text-[#851de0] hover:opacity-70 text-sm">
                              Join
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
              {/* 🟢 Main conference area */}
              <div className="flex-1 flex flex-col  min-w-0 overflow-hidden">
                {/* Video layout */}
                {!focusTrack ? (
                  <div className="lk-grid-layout-wrapper">
                    <GridLayout tracks={tracks}>
                      {/* <ParticipantTile /> */}
                      {/* {cameraEnabled ? (
                        <ParticipantTile />
                      ) : (
                        <ParticipantAudioTile />
                      )} */}
                      <CustomParticipantTile />
                    </GridLayout>
                  </div>
                ) : (
                  <div className="lk-focus-layout-wrapper">
                    <FocusLayoutContainer>
                      <CarouselLayout tracks={carouselTracks}>
                        <ParticipantTile />
                      </CarouselLayout>
                      {focusTrack && <FocusLayout trackRef={focusTrack} />}
                    </FocusLayoutContainer>
                  </div>
                )}

                {/* Control bar + toggle */}
                <div className="flex items-center justify-center text-sm">
                  <button
                    className="bg-zinc-800 text-white h-[36px] md:h-[44px] px-2 hover:bg-zinc-700 rounded-lg cursor-pointer"
                    onClick={toggleSidebar}
                  >
                    {/* {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"} */}
                    <EllipsisVertical />
                  </button>
                  <ControlBar
                    variation="minimal"
                    controls={{ chat: true, settings: !!SettingsComponent }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chat and settings */}
          <Chat
            style={{ display: widgetState.showChat ? "grid" : "none" }}
            messageFormatter={chatMessageFormatter}
            messageEncoder={chatMessageEncoder}
            messageDecoder={chatMessageDecoder}
          />
          {SettingsComponent && (
            <div
              className="lk-settings-menu-modal"
              style={{ display: widgetState.showSettings ? "block" : "none" }}
            >
              <SettingsComponent />
            </div>
          )}
        </LayoutContextProvider>
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
