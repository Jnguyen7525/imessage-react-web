import Image from "next/image";

type OutgoingCallStatusProps = {
  calleeName: string;
  calleeAvatar: string;
};

export const OutgoingCallStatus = ({
  calleeName,
  calleeAvatar,
}: OutgoingCallStatusProps) => {
  return (
    // <div className="fixed bottom-6 right-6 bg-zinc-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-fade-in">
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white p-6 rounded-xl shadow-lg flex items-center gap-4 animate-fade-in z-50">
      <Image
        src={calleeAvatar}
        alt={`${calleeName}'s avatar`}
        className="w-12 h-12 rounded-full"
      />
      <div className="flex flex-col">
        <span className="font-semibold">Calling {calleeName}</span>
        <span className="text-zinc-400 animate-pulse">
          Waiting for response...
        </span>
      </div>
    </div>
  );
};
