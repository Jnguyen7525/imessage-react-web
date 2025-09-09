// import { Track } from "livekit-client";
// import { useParticipantTile } from "../../hooks";
// import { AudioTrack } from "./AudioTrack";
// import { VideoTrack } from "./VideoTrack";
// import { TrackMutedIndicator } from "./TrackMutedIndicator";
// import { ParticipantName } from "./ParticipantName";
// import { ConnectionQualityIndicator } from "./ConnectionQualityIndicator";
// import { TrackRefContext, useEnsureTrackRef } from "../../context";
// import { Volume2 } from "lucide-react";

import {
  AudioTrack,
  ConnectionQualityIndicator,
  ParticipantName,
  ParticipantTileProps,
  TrackMutedIndicator,
  TrackRefContext,
  useEnsureTrackRef,
  useParticipantTile,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Volume2 } from "lucide-react";
import React from "react";

export const AdaptiveParticipantTile = React.forwardRef<
  HTMLDivElement,
  ParticipantTileProps
>(function AdaptiveParticipantTile(
  { trackRef, disableSpeakingIndicator, onParticipantClick, ...htmlProps },
  ref
) {
  const trackReference = useEnsureTrackRef(trackRef);
  const { elementProps } = useParticipantTile({
    trackRef: trackReference,
    htmlProps,
    disableSpeakingIndicator,
    onParticipantClick,
  });

  const isVideoTrack =
    trackReference.publication?.kind === "video" ||
    trackReference.source === Track.Source.Camera ||
    trackReference.source === Track.Source.ScreenShare;

  return (
    <div
      ref={ref}
      style={{ position: "relative", minHeight: "160px" }}
      {...elementProps}
    >
      <TrackRefContext.Provider value={trackReference}>
        {isVideoTrack ? (
          <VideoTrack trackRef={trackReference} />
        ) : (
          <>
            <AudioTrack trackRef={trackReference} />
            <div className="flex flex-col items-center justify-center py-4">
              <Volume2
                size={32}
                className={`mb-2 ${
                  trackReference.participant.isSpeaking
                    ? "text-green-400 animate-pulse"
                    : "text-zinc-400"
                }`}
              />
              <ParticipantName />
            </div>
          </>
        )}
        <div className="lk-participant-metadata">
          <div className="lk-participant-metadata-item">
            <TrackMutedIndicator trackRef={trackReference} />
            <ConnectionQualityIndicator />
          </div>
        </div>
      </TrackRefContext.Provider>
    </div>
  );
});
