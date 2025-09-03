import { videoCodecs } from "livekit-client";
import { VideoConferenceClientImpl } from "./VideoConferenceClientImpl";
import { isVideoCodec } from "@/lib/types";

export default async function CustomRoomConnection(props: {
  searchParams: Promise<{
    liveKitUrl?: string;
    token?: string;
    codec?: string;
    // !added this for sidebar caller panel
    participantName: string; // ✅ Add this
  }>;
}) {
  const { liveKitUrl, token, codec, participantName } =
    await props.searchParams;
  if (typeof liveKitUrl !== "string") {
    return <h2>Missing LiveKit URL</h2>;
  }
  if (typeof token !== "string") {
    return <h2>Missing LiveKit token</h2>;
  }
  if (codec !== undefined && !isVideoCodec(codec)) {
    return (
      <h2>
        Invalid codec, if defined it has to be [{videoCodecs.join(", ")}].
      </h2>
    );
  }
  const name =
    typeof participantName === "string" ? participantName : "anonymous";

  return (
    <main data-lk-theme="default" style={{ height: "100%" }}>
      <VideoConferenceClientImpl
        liveKitUrl={liveKitUrl}
        token={token}
        codec={codec}
        participantName={name} // ✅ Pass it here
      />
    </main>
  );
}
