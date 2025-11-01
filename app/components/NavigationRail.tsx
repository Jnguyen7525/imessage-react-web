import {
  CalendarDays,
  ChevronLeft,
  MessageCircle,
  Settings,
  Video,
} from "lucide-react";

type PanelType = "contacts" | "workspaces" | "meetings" | "calendar";

interface NavigationRailProps {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export default function NavigationRail({
  activePanel,
  setActivePanel,
  collapsed,
  toggleCollapsed,
}: NavigationRailProps) {
  return (
    <div
      className={`bg-gradient-to-b from-slate-800 to-slate-950 text-white flex flex-col items-center py-4 space-y-6 ${
        collapsed ? "w-12" : "w-16"
      } transition-all`}
    >
      <button
        onClick={() => setActivePanel("contacts")}
        className="cursor-pointer hover:opacity-50"
      >
        <MessageCircle
          className={`size-6 ${
            activePanel === "contacts" ? "text-blue-400" : "text-white"
          }`}
        />
      </button>
      <button
        onClick={() => setActivePanel("meetings")}
        className="cursor-pointer hover:opacity-50"
      >
        <Video
          className={`size-6 ${
            activePanel === "meetings" ? "text-blue-400" : "text-white"
          }`}
        />
      </button>
      <button
        onClick={() => setActivePanel("workspaces")}
        className="cursor-pointer hover:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          stroke={activePanel === "workspaces" ? "#60A5FA" : "#9CA3AF"} // Tailwind: blue-400 or white
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
        >
          {/* Center user */}
          <circle cx="16" cy="10" r="4" />
          <path d="M10 22c0-3 3-5 6-5s6 2 6 5" />

          {/* Left user */}
          <circle cx="6" cy="12" r="3" />
          <path d="M2 22c0-2 2-4 4-4" />

          {/* Right user */}
          <circle cx="26" cy="12" r="3" />
          <path d="M30 22c0-2-2-4-4-4" />
        </svg>
      </button>
      <button
        onClick={() => setActivePanel("calendar")}
        className="cursor-pointer hover:opacity-50"
      >
        <CalendarDays
          className={`size-6 ${
            activePanel === "calendar" ? "text-blue-400" : "text-white"
          }`}
        />
      </button>
      {(activePanel === "contacts" || activePanel === "workspaces") && (
        <button
          onClick={toggleCollapsed}
          className="cursor-pointer hover:opacity-50"
        >
          <ChevronLeft className={`size-6 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
