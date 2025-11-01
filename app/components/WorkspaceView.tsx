import { useState } from "react";
import { Workspace } from "./WorkspacePanel";

const tabs = [
  "Posts",
  "Files",
  "Photos",
  "Events",
  "Invite",
  "Share Link",
  "Settings",
];

export default function WorkspaceView({ workspace }: { workspace: Workspace }) {
  const [activeTab, setActiveTab] = useState("Posts");

  return (
    <div className="flex flex-col flex-1 p-6 gap-6 overflow-y-auto text-white">
      {/* Workspace Header */}
      <h2 className="text-xl font-semibold">{workspace.name}</h2>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-3 py-1 rounded ${
              activeTab === tab
                ? "bg-blue-500 text-white hover:opacity-50 cursor-pointer"
                : "text-white hover:opacity-50 cursor-pointer"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Post Box */}
      {activeTab === "Posts" && (
        <div className="flex flex-col gap-3">
          <textarea
            placeholder="Share an update with your workspace..."
            className="w-full h-24 bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white resize-none outline-none"
          />
          <button className="self-end bg-blue-600 px-2 py-1 rounded-lg hover:opacity-50 cursor-pointer text-sm">
            Post
          </button>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== "Posts" && (
        <div className="text-sm text-white">
          {activeTab} content will go here...
        </div>
      )}
    </div>
  );
}
