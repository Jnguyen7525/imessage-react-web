import { FolderPlus, PlusCircle } from "lucide-react";

export interface Workspace {
  id: string;
  name: string;
}

interface WorkspacePanelProps {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace) => void;
}

export default function WorkspacePanel({
  workspaces,
  selectedWorkspace,
  setSelectedWorkspace,
}: WorkspacePanelProps) {
  return (
    <div className="w-[250px] bg-slate-950 text-white flex flex-col border-r border-slate-600 p-4 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workspaces</h2>
        <button className="text-blue-400 hover:opacity-50 cursor-pointer text-sm flex items-center gap-1">
          <PlusCircle size={16} />
          Create
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => setSelectedWorkspace(ws)}
            className={`px-4 py-2 rounded text-left hover:opacity-50 cursor-pointer ${
              selectedWorkspace?.id === ws.id
                ? "bg-slate-800 text-blue-400"
                : "text-white"
            }`}
          >
            {ws.name}
          </button>
        ))}
      </div>

      <button className="mt-4 text-sm text-blue-400 hover:opacity-50 cursor-pointer flex items-center gap-1">
        <FolderPlus size={16} />
        Add Channel
      </button>
    </div>
  );
}
