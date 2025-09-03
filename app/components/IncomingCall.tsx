import { Phone, PhoneOff } from "lucide-react";
import Image from "next/image";

type IncomingCallPopupProps = {
  callerName: string;
  callerAvatar: string;
  onAccept: () => void;
  onReject: () => void;
};

export const IncomingCallPopup = ({
  callerName,
  callerAvatar,
  onAccept,
  onReject,
}: IncomingCallPopupProps) => {
  return (
    // <div className="fixed bottom-6 right-6 bg-zinc-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-fade-in">
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white p-6 rounded-xl animate-fade-in z-50">
      <div className=" flex flex-col items-center gap-2  z-50">
        <Image
          src={callerAvatar}
          alt={`${callerName}'s avatar`}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-semibold animate-pulse">
            {callerName} is calling you
          </span>
          <div className="flex gap-3 mt-2 w-full items-center justify-center">
            <button
              onClick={onAccept}
              className="bg-green-600 hover:bg-green-700 p-2 rounded-full"
            >
              <Phone className="w-5 h-5 cursor-pointer" />
            </button>
            <button
              onClick={onReject}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
            >
              <PhoneOff className="w-5 h-5 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
