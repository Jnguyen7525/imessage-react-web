import { AudioLines, Plus } from "lucide-react";
import React from "react";
import { ConversationMessage } from "./ConversationMessage";
import { conversationMessages } from "@/utils/messages";

const Phone: React.FC = () => {
  return (
    <div className="relative w-fit h-[900px] max-w-[90vw] max-h-[90vh] rounded-[5rem] shadow-2xl font-sans text-white flex flex-col border-[3px] bg-black border-slate-800">
      <div className=" w-[400px] h-[900px] max-w-[90vw] max-h-[90vh] overflow-hidden rounded-[5rem] shadow-2xl font-sans text-white flex flex-col border-[6px] border-black ">
        {/* Side Buttons */}
        {/* Volume Buttons (Left) */}
        <div className="absolute left-[-6px] top-[160px] w-[4px] h-[40px] bg-slate-800 rounded-xs" />
        <div className="absolute left-[-6px] top-[220px] w-[4px] h-[60px] bg-slate-800 rounded-xs" />
        <div className="absolute left-[-6px] top-[300px] w-[4px] h-[60px] bg-slate-800 rounded-xs" />

        {/* Power Button (Right) */}
        <div className="absolute right-[-6px] top-[250px] w-[4px] h-[80px] bg-slate-800 rounded-xs" />

        <div className="absolute right-[-6px] bottom-[250px] w-[4px] h-[80px] bg-slate-800 rounded-xs" />

        {/* Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-full z-10 flex items-center justify-end pr-2 border border-slate-800 ">
          <div className="bg-black border border-slate-800 w-2 h-2 rounded-full"></div>
        </div>

        {/* Status Icons (Top Right) */}
        <div className="absolute top-7 right-12 flex items-center space-x-1 text-white text-xs z-20">
          {/* Signal Bars */}
          <div className="flex items-end space-x-[1px]">
            <div className="w-[2px] h-[4px] bg-white rounded-sm" />
            <div className="w-[2px] h-[6px] bg-white rounded-sm" />
            <div className="w-[2px] h-[8px] bg-white rounded-sm" />
            <div className="w-[2px] h-[10px] bg-white rounded-sm" />
            <div className="w-[2px] h-[12px] bg-white rounded-sm" />
          </div>

          {/* Wi-Fi Icon */}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.53 16.11a6 6 0 016.94 0M5.1 13.1a10 10 0 0113.8 0M1.67 10.1a15 15 0 0120.66 0M12 20h.01"
            />
          </svg>

          {/* Battery Icon */}
          <div className="flex items-center space-x-[1px]">
            <div className="w-5 h-2.5 border border-white rounded-sm flex items-center justify-end pr-[1px]">
              <div className="w-full h-full bg-white " />
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className="flex flex-col flex-1 pt-14 bg-gradient-to-t from-slate-800 to-slate-950 overflow-hidden">
          {/* Scrollable messages */}
          <div className="flex-1 flex flex-col overflow-hidden justify-between text-white">
            <div className="flex flex-col overflow-y-auto scrollbar-hide gap-2 p-10">
              {conversationMessages.map((msg) => (
                <ConversationMessage key={msg.id} data={msg} />
              ))}
            </div>

            {/* Input Bar */}
            <div className="px-8 pb-4">
              <div className="flex items-center">
                <button>
                  <Plus size={24} className="cursor-pointer hover:opacity-50" />
                </button>
                <div className="flex items-center justify-between flex-1 mx-2 border bg-zinc-950 border-zinc-800 rounded-full px-5 py-1">
                  <input
                    className="w-full bg-transparent text-white placeholder-gray-400 rounded-full outline-none"
                    placeholder="Message..."
                  />
                  <button>
                    <AudioLines
                      size={24}
                      className="cursor-pointer hover:opacity-50"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[5px] bg-zinc-800 rounded-full" />
      </div>
    </div>
  );
};

export default Phone;
