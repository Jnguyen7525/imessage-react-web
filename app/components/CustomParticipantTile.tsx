// import * as React from "react";
// import type { Participant } from "livekit-client";
// import { Track } from "livekit-client";
// import type {
//   ParticipantClickEvent,
//   TrackReferenceOrPlaceholder,
// } from "@livekit/components-core";
// import {
//   isTrackReference,
//   isTrackReferencePinned,
// } from "@livekit/components-core";
// import { ConnectionQualityIndicator } from "./ConnectionQualityIndicator";
// import { ParticipantName } from "./ParticipantName";
// import { TrackMutedIndicator } from "./TrackMutedIndicator";
// import {
//   ParticipantContext,
//   TrackRefContext,
//   useEnsureTrackRef,
//   useFeatureContext,
//   useMaybeLayoutContext,
//   useMaybeParticipantContext,
//   useMaybeTrackRefContext,
// } from "../../context";
// import { FocusToggle } from "../controls/FocusToggle";
// import { ParticipantPlaceholder } from "../../assets/images";
// import { LockLockedIcon, ScreenShareIcon } from "../../assets/icons";
// import { VideoTrack } from "./VideoTrack";
// import { AudioTrack } from "./AudioTrack";
// import { useParticipantTile } from "../../hooks";
// import { useIsEncrypted } from "../../hooks/useIsEncrypted";
// import { BarVisualizer } from "./BarVisualizer";

import { isTrackReferencePlaceholder } from "@livekit/components-core";
import {
  AudioTrack,
  BarVisualizer,
  ConnectionQualityIndicator,
  FocusToggle,
  isTrackReference,
  LockLockedIcon,
  ParticipantClickEvent,
  ParticipantContext,
  ParticipantName,
  ParticipantPlaceholder,
  PinState,
  ScreenShareIcon,
  TrackMutedIndicator,
  TrackRefContext,
  TrackReference,
  TrackReferenceOrPlaceholder,
  useEnsureTrackRef,
  useFeatureContext,
  useIsEncrypted,
  useMaybeLayoutContext,
  useMaybeParticipantContext,
  useMaybeTrackRefContext,
  useParticipantTile,
  VideoTrack,
} from "@livekit/components-react";
import { Participant, Track } from "livekit-client";
import React from "react";

/** @public */
export interface ParticipantTileProps
  extends React.HTMLAttributes<HTMLDivElement> {
  trackRef?: TrackReferenceOrPlaceholder;
  disableSpeakingIndicator?: boolean;
  onParticipantClick?: (event: ParticipantClickEvent) => void;
}

export function ParticipantContextIfNeeded(
  props: React.PropsWithChildren<{ participant?: Participant }>
) {
  const hasContext = !!useMaybeParticipantContext();
  return props.participant && !hasContext ? (
    <ParticipantContext.Provider value={props.participant}>
      {props.children}
    </ParticipantContext.Provider>
  ) : (
    <>{props.children}</>
  );
}

export function TrackRefContextIfNeeded(
  props: React.PropsWithChildren<{ trackRef?: TrackReferenceOrPlaceholder }>
) {
  const hasContext = !!useMaybeTrackRefContext();
  return props.trackRef && !hasContext ? (
    <TrackRefContext.Provider value={props.trackRef}>
      {props.children}
    </TrackRefContext.Provider>
  ) : (
    <>{props.children}</>
  );
}

export const CustomParticipantTile: (
  props: ParticipantTileProps & React.RefAttributes<HTMLDivElement>
) => React.ReactNode = React.forwardRef<HTMLDivElement, ParticipantTileProps>(
  function ParticipantTile(
    {
      trackRef,
      children,
      onParticipantClick,
      disableSpeakingIndicator,
      ...htmlProps
    },
    ref
  ) {
    const trackReference = useEnsureTrackRef(trackRef);
    const { elementProps } = useParticipantTile<HTMLDivElement>({
      htmlProps,
      disableSpeakingIndicator,
      onParticipantClick,
      trackRef: trackReference,
    });

    const isEncrypted = useIsEncrypted(trackReference.participant);
    const layoutContext = useMaybeLayoutContext();
    const autoManageSubscription = useFeatureContext()?.autoSubscription;

    /**
     * Check if the `TrackReference` is pinned.
     */
    function isTrackReferencePinned(
      trackReference: TrackReferenceOrPlaceholder,
      pinState: PinState | undefined
    ): boolean {
      if (typeof pinState === "undefined") {
        return false;
      }
      if (isTrackReference(trackReference)) {
        return pinState.some(
          (pinnedTrackReference) =>
            pinnedTrackReference.participant.identity ===
              trackReference.participant.identity &&
            isTrackReference(pinnedTrackReference) &&
            pinnedTrackReference.publication.trackSid ===
              trackReference.publication.trackSid
        );
      } else if (isTrackReferencePlaceholder(trackReference)) {
        return pinState.some(
          (pinnedTrackReference) =>
            pinnedTrackReference.participant.identity ===
              trackReference.participant.identity &&
            isTrackReferencePlaceholder(pinnedTrackReference) &&
            pinnedTrackReference.source === trackReference.source
        );
      } else {
        return false;
      }
    }

    const handleSubscribe = React.useCallback(
      (subscribed: boolean) => {
        if (
          trackReference.source &&
          !subscribed &&
          layoutContext?.pin.dispatch &&
          isTrackReferencePinned(trackReference, layoutContext.pin.state)
        ) {
          layoutContext.pin.dispatch({ msg: "clear_pin" });
        }
      },
      [trackReference, layoutContext]
    );

    const hasVideo =
      isTrackReference(trackReference) &&
      (trackReference.publication?.kind === "video" ||
        trackReference.source === Track.Source.Camera ||
        trackReference.source === Track.Source.ScreenShare);

    return (
      <div ref={ref} style={{ position: "relative" }} {...elementProps}>
        <TrackRefContextIfNeeded trackRef={trackReference}>
          <ParticipantContextIfNeeded participant={trackReference.participant}>
            {children ?? (
              <>
                {hasVideo ? (
                  <VideoTrack
                    trackRef={trackReference}
                    onSubscriptionStatusChanged={handleSubscribe}
                    manageSubscription={autoManageSubscription}
                  />
                ) : (
                  isTrackReference(trackReference) && (
                    <AudioTrack
                      trackRef={trackReference}
                      onSubscriptionStatusChanged={handleSubscribe}
                    />
                  )
                )}

                <div className="lk-participant-placeholder">
                  {hasVideo ? (
                    <ParticipantPlaceholder />
                  ) : (
                    <BarVisualizer barCount={7} options={{ minHeight: 8 }} />
                  )}
                </div>

                <div className="lk-participant-metadata">
                  <div className="lk-participant-metadata-item">
                    {trackReference.source === Track.Source.Camera ? (
                      <>
                        {isEncrypted && (
                          <LockLockedIcon style={{ marginRight: "0.25rem" }} />
                        )}
                        <TrackMutedIndicator
                          trackRef={{
                            participant: trackReference.participant,
                            source: Track.Source.Microphone,
                          }}
                          show="muted"
                        />
                        <ParticipantName />
                      </>
                    ) : (
                      <>
                        <ScreenShareIcon style={{ marginRight: "0.25rem" }} />
                        <ParticipantName>&apos;s screen</ParticipantName>
                      </>
                    )}
                  </div>
                  <ConnectionQualityIndicator className="lk-participant-metadata-item" />
                </div>
              </>
            )}
            <FocusToggle trackRef={trackReference} />
          </ParticipantContextIfNeeded>
        </TrackRefContextIfNeeded>
      </div>
    );
  }
);
