import Image from "next/image";
import { useCallStore } from "@/store/useCallStore"; // ✅ import your store

type OutgoingCallStatusProps = {
  calleeName: string;
  calleeAvatar: string;
};

export const OutgoingCallStatus = ({
  calleeName,
  calleeAvatar,
}: OutgoingCallStatusProps) => {
  const clearOutgoingCall = useCallStore((s) => s.clearOutgoingCall);

  // const handleCancel = () => {
  //   clearOutgoingCall();
  //   localStorage.setItem("callDeclined", "manual-cancel"); // 👈 optional signal
  // };
  const handleCancel = async () => {
    console.log("❌ Call manually declined by caller");
    // ✅ Notify callee via FCM
    await fetch("/api/send-call-declined", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callerId: calleeName, // 👈 this is actually the recipient
        roomName: useCallStore.getState().outgoingCall?.roomName,
        manualCancel: false,
      }),
    });

    clearOutgoingCall();
    // localStorage.setItem("callDeclined", "manual-cancel"); // optional signal
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white p-6 rounded-xl animate-fade-in z-50">
      <div className="flex flex-col items-center justify-center gap-4 z-50">
        <Image
          src={calleeAvatar}
          alt={`${calleeName}'s avatar`}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col items-center justify-center">
          <span className="font-semibold">Calling {calleeName}</span>
          <span className="text-zinc-400 animate-pulse">
            Waiting for response...
          </span>
        </div>
        <button
          onClick={handleCancel}
          className=" px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
