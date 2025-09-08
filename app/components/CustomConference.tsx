import { MessageFormatter } from "@livekit/components-react";
import { CustomAudioConference } from "./CustomAudioConference";
import { CustomVideoConference } from "./CustomVideoConference";

export function CustomConference({
  audioOnly,
  participantName,
  ...props
}: {
  audioOnly?: boolean;
  participantName: string;
  chatMessageFormatter?: MessageFormatter;
  SettingsComponent?: React.ComponentType;
}) {
  return audioOnly ? (
    <CustomAudioConference participantName={participantName} />
  ) : (
    <CustomVideoConference
      chatMessageFormatter={props.chatMessageFormatter}
      SettingsComponent={props.SettingsComponent}
    />
  );
}
