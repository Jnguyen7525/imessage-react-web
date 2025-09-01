"use client";

import {
  formatChatMessageLinks,
  RoomContext,
  VideoConference,
} from "@livekit/components-react";
import {
  ExternalE2EEKeyProvider,
  LogLevel,
  Room,
  RoomConnectOptions,
  RoomOptions,
  VideoPresets,
  type VideoCodec,
} from "livekit-client";
import { DebugMode } from "@/lib/Debug";
import { useEffect, useMemo, useState } from "react";
import { KeyboardShortcuts } from "@/lib/KeyboardShortcuts";
import { SettingsMenu } from "@/lib/SettingsMenu";
import { useSetupE2EE } from "@/lib/useSetupE2EE";
import { useLowCPUOptimizer } from "@/lib/usePerfomanceOptimiser";
import SidebarCallerPanel from "../components/SidebarCallerPanel";
import { CustomVideoConference } from "../components/CustomVideoConference";

export function VideoConferenceClientImpl(props: {
  liveKitUrl: string;
  token: string;
  codec: VideoCodec | undefined;
  // !added this for sidebar caller panel
  participantName: string; // ✅ Add this
}) {
  const keyProvider = new ExternalE2EEKeyProvider();
  const { worker, e2eePassphrase } = useSetupE2EE();
  const e2eeEnabled = !!(e2eePassphrase && worker);

  const [e2eeSetupComplete, setE2eeSetupComplete] = useState(false);

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
      room
        .connect(props.liveKitUrl, props.token, connectOptions)
        .then(() => {
          return Promise.all([
            room.localParticipant.setCameraEnabled(true),
            room.localParticipant.setMicrophoneEnabled(true),
          ]);
        })
        .catch(console.error);
    }
  }, [e2eeSetupComplete, room, props.liveKitUrl, props.token, connectOptions]);

  useLowCPUOptimizer(room);

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
        <CustomVideoConference
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
