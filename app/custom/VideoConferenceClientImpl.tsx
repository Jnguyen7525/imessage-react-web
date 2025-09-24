"use client";

import {
  formatChatMessageLinks,
  RoomContext,
  VideoConference,
} from "@livekit/components-react";
import {
  ExternalE2EEKeyProvider,
  LogLevel,
  RemoteParticipant,
  Room,
  RoomConnectOptions,
  RoomEvent,
  RoomOptions,
  VideoPresets,
  type VideoCodec,
} from "livekit-client";
import { DebugMode } from "@/lib/Debug";
import { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardShortcuts } from "@/lib/KeyboardShortcuts";
import { SettingsMenu } from "@/lib/SettingsMenu";
import { useSetupE2EE } from "@/lib/useSetupE2EE";
import { useLowCPUOptimizer } from "@/lib/usePerfomanceOptimiser";

import { CustomVideoConference } from "../components/CustomVideoConference";

export function VideoConferenceClientImpl(props: {
  liveKitUrl: string;
  token: string;
  codec: VideoCodec | undefined;
  // !added this for sidebar caller panel
  participantName: string; // ✅ Add this
  audioOnly?: boolean;
}) {
  const keyProvider = new ExternalE2EEKeyProvider();
  const { worker, e2eePassphrase } = useSetupE2EE();
  const e2eeEnabled = !!(e2eePassphrase && worker);

  const [e2eeSetupComplete, setE2eeSetupComplete] = useState(false);

  const hasConnectedRef = useRef(false);

  const roomOptions = useMemo((): RoomOptions => {
    return {
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
        red: !e2eeEnabled,
        videoCodec: props.codec,
      },
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
      e2ee: e2eeEnabled
        ? {
            keyProvider,
            worker,
          }
        : undefined,
    };
  }, [e2eeEnabled, props.codec, keyProvider, worker]);

  const room = useMemo(() => new Room(roomOptions), [roomOptions]);

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  useEffect(() => {
    if (e2eeEnabled) {
      keyProvider.setKey(e2eePassphrase).then(() => {
        room.setE2EEEnabled(true).then(() => {
          setE2eeSetupComplete(true);
        });
      });
    } else {
      setE2eeSetupComplete(true);
    }
  }, [e2eeEnabled, e2eePassphrase, keyProvider, room, setE2eeSetupComplete]);

  // useEffect(() => {
  //   if (e2eeSetupComplete) {
  //     room.connect(props.liveKitUrl, props.token, connectOptions).catch((error) => {
  //       console.error(error);
  //     });
  //     room.localParticipant.enableCameraAndMicrophone().catch((error) => {
  //       console.error(error);
  //     });
  //   }
  // }, [room, props.liveKitUrl, props.token, connectOptions, e2eeSetupComplete]);
  // !fixes the error  Element not part of the array: bob__dwo9_camera_placeholder not in alice__dwo9_camera_TR_VCPxWn3AhBKg7b,bob__dwo9_camera_TR_VCjLRxKtFqEkBZ
  useEffect(() => {
    if (e2eeSetupComplete) {
      // if (e2eeSetupComplete && !hasConnectedRef.current) {
      //   hasConnectedRef.current = true;

      room
        .connect(props.liveKitUrl, props.token, connectOptions)
        .then(() => {
          console.log(
            "🧍 Local participant identity:",
            room.localParticipant.identity
          );

          // 🔧 Helper to log all participants
          const logCurrentParticipants = () => {
            const allParticipants = [
              room.localParticipant,
              ...Array.from(room.remoteParticipants.values()),
            ];
            console.log("👥 Current participants in room:", room.name);
            allParticipants.forEach((p) => {
              console.log(`- ${p.identity}`);
            });
            console.log("📊 Total participants:", allParticipants.length);
          };

          // ✅ Log when someone connects
          room.on(
            RoomEvent.ParticipantConnected,
            (participant: RemoteParticipant) => {
              console.log("🔗 Participant connected:", participant.identity);
              logCurrentParticipants();
            }
          );

          // ✅ Log when someone disconnects
          room.on(
            RoomEvent.ParticipantDisconnected,
            (participant: RemoteParticipant) => {
              console.log("❌ Participant disconnected:", participant.identity);
              logCurrentParticipants();
            }
          );

          // ✅ Log when the room disconnects (e.g. kicked, network drop)
          room.on(RoomEvent.Disconnected, (reason) => {
            console.warn("❌ Room disconnected:", reason);
            logCurrentParticipants();
          });

          return Promise.all([
            // room.localParticipant.setCameraEnabled(true),
            room.localParticipant.setCameraEnabled(!props.audioOnly),

            room.localParticipant.setMicrophoneEnabled(true),
          ]);
        })
        .catch(console.error);
    }
    // }, [e2eeSetupComplete, room, props.liveKitUrl, props.token, connectOptions]);
  }, [
    e2eeSetupComplete,
    room,
    props.liveKitUrl,
    props.token,
    connectOptions,
    props.audioOnly,
  ]);

  useLowCPUOptimizer(room);

  useEffect(() => {
    console.log(
      "🧍 Mounting VideoConferenceClientImpl with identity:",
      props.participantName
    );
  }, [props.participantName]);

  // !clean up room on unmount
  useEffect(() => {
    return () => {
      console.log("🧍 Unmounting VideoConferenceClientImpl");
      room.disconnect();
    };
  }, []);

  return (
    <div className="lk-room-container">
      <RoomContext.Provider value={room}>
        <KeyboardShortcuts />
        {/* 👇 Sidebar with contacts */}
        {/* <SidebarCallerPanel participantName={props.participantName} /> */}

        {/* <VideoConference
          chatMessageFormatter={formatChatMessageLinks}
          SettingsComponent={
            process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === "true"
              ? SettingsMenu
              : undefined
          }
        /> */}
        {/* <CustomVideoConference
          chatMessageFormatter={formatChatMessageLinks}
          SettingsComponent={
            process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === "true"
              ? SettingsMenu
              : undefined
          }
        /> */}

        <CustomVideoConference
          // participantName={props.participantName}
          cameraEnabled={!props.audioOnly} // ✅ disables camera for audio-only calls
          chatMessageFormatter={formatChatMessageLinks}
          SettingsComponent={
            process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU === "true"
              ? SettingsMenu
              : undefined
          }
        />
        <DebugMode logLevel={LogLevel.debug} />
      </RoomContext.Provider>
    </div>
  );
}
