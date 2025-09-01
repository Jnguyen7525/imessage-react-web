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

import { messagesArray } from "@/utils/messages";
import {
  isEqualTrackRef,
  isTrackReference,
  isWeb,
  log,
  MessageDecoder,
  MessageEncoder,
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
  ParticipantTile,
  RoomAudioRenderer,
  TrackReferenceOrPlaceholder,
  useCreateLayoutContext,
  useParticipants,
  usePinnedTracks,
  useRoomContext,
  useTracks,
  WidgetState,
} from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";
import { EllipsisVertical, Phone, UserMinus, UserMinus2 } from "lucide-react";
import Image from "next/image";
import React from "react";

/**
 * @public
 */
export interface VideoConferenceProps
  extends React.HTMLAttributes<HTMLDivElement> {
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

  const room = useRoomContext();

  const participants = useParticipants();

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

  const handleRemoveParticipant = (identity: string) => {
    console.log(`Request to remove participant: ${identity}`);
    // You could trigger a server-side API call here if you're an admin
  };
  const getAvatarForParticipant = (identity: string) => {
    const match = messagesArray.find((msg) => msg.id === identity);
    return match?.avatar ?? null;
  };
  const getAvatarByName = (nameOrId: string): string | null => {
    const match = messagesArray.find(
      (msg) => msg.name === nameOrId || msg.id === nameOrId
    );
    return match?.avatar ?? null;
  };

  //   useWarnAboutMissingStyles();

  return (
    // <div className="lk-video-conference" {...props}>
    //   {isWeb() && (
    //     <LayoutContextProvider
    //       value={layoutContext}
    //       // onPinChange={handleFocusStateChange}
    //       onWidgetChange={widgetUpdate}
    //     >
    //       <div className="lk-video-conference-inner">
    //         {!focusTrack ? (
    //           <div className="lk-grid-layout-wrapper">
    //             <GridLayout tracks={tracks}>
    //               <ParticipantTile />
    //             </GridLayout>
    //           </div>
    //         ) : (
    //           <div className="lk-focus-layout-wrapper">
    //             <FocusLayoutContainer>
    //               <CarouselLayout tracks={carouselTracks}>
    //                 <ParticipantTile />
    //               </CarouselLayout>
    //               {focusTrack && <FocusLayout trackRef={focusTrack} />}
    //             </FocusLayoutContainer>
    //           </div>
    //         )}
    //         {/* <ControlBar
    //           controls={{ chat: true, settings: !!SettingsComponent }}
    //         /> */}
    //         <div className="flex items-center justify-center">
    //           {/* 👈 Inject custom button on the left side */}
    //           <button
    //             className="bg-zinc-800 text-white h-[44px] px-3 hover:bg-zinc-700 rounded-lg cursor-pointer"
    //             onClick={toggleSidebar}
    //           >
    //             {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
    //           </button>

    //           <ControlBar
    //             controls={{ chat: true, settings: !!SettingsComponent }}
    //           />
    //         </div>
    //       </div>
    //       <Chat
    //         style={{ display: widgetState.showChat ? "grid" : "none" }}
    //         messageFormatter={chatMessageFormatter}
    //         messageEncoder={chatMessageEncoder}
    //         messageDecoder={chatMessageDecoder}
    //       />
    //       {SettingsComponent && (
    //         <div
    //           className="lk-settings-menu-modal"
    //           style={{ display: widgetState.showSettings ? "block" : "none" }}
    //         >
    //           <SettingsComponent />
    //         </div>
    //       )}
    //     </LayoutContextProvider>
    //   )}
    //   <RoomAudioRenderer />
    //   <ConnectionStateToast />
    // </div>

    <div className="lk-video-conference " {...props}>
      {isWeb() && (
        <LayoutContextProvider
          value={layoutContext}
          onWidgetChange={widgetUpdate}
        >
          <div className="lk-video-conference-inner flex">
            <div className="flex-1 flex overflow-hidden">
              {/* 🟣 Sidebar */}
              {/* <div
                className={`flex-shrink-0 transition-all duration-300 bg-[#09090b] text-white shadow-lg overflow-y-auto ${
                  sidebarOpen ? "w-fit p-4" : "w-0 p-0"
                }`}
              >
                <h2 className="text-lg font-semibold mb-4">Contacts</h2>
                <ul className="space-y-3">
                  {messagesArray.map((msg) => (
                    <li
                      key={msg.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={msg.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{msg.name}</span>
                      </div>
                      <button className="text-[#851de0] hover:opacity-70 cursor-pointer">
                        <Phone size={22} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div> */}
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
                          {/* <div className="flex items-center gap-2">
                            <Image
                              src={msg.avatar}
                              alt=""
                              className="w-8 h-8 rounded-full"
                            />
                            <span>{msg.name}</span>
                          </div> */}
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

                          <button className="text-[#851de0] hover:opacity-70 cursor-pointer">
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
                      <ParticipantTile />
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
