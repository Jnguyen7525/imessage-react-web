import { Link, Link2 } from "lucide-react";

const meetingLinks = [
  { id: "abc123", title: "Team Sync", url: "https://tim.app/m/abc123" },
  { id: "def456", title: "Client Demo", url: "https://tim.app/m/def456" },
];

const scheduledMeetings = [
  {
    id: "mtg001",
    title: "Product Strategy",
    time: "Nov 3, 2025 · 2:00 PM",
    participants: ["John", "Ava", "Liam"],
  },
  {
    id: "mtg002",
    title: "Design Review",
    time: "Nov 4, 2025 · 11:00 AM",
    participants: ["John", "Maya"],
  },
];

export default function MeetingView() {
  return (
    <div className="flex flex-col flex-1 p-20 gap-20 overflow-y-auto text-white">
      {/* Top Buttons */}
      <div className="flex w-full items-center justify-evenly">
        <button className="flex items-center justify-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:opacity-50 cursor-pointer">
          <Link2 />
          <span>Create Meeting Link</span>
        </button>
        <button className="bg-slate-800 px-4 py-2 rounded-lg hover:opacity-50 cursor-pointer">
          Schedule Meeting
        </button>
        <button className="bg-slate-800 px-4 py-2 rounded-lg hover:opacity-50 cursor-pointer">
          Join with Meeting ID
        </button>
      </div>

      {/* Saved Meeting Links */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Meeting Links</h2>
        <div className="flex flex-col gap-3">
          {meetingLinks.map((link) => (
            <div
              key={link.id}
              className="bg-slate-800 p-3 rounded flex justify-between items-center"
            >
              <span>{link.title}</span>
              <a
                href={link.url}
                target="_blank"
                className="text-blue-400 text-sm hover:underline"
              >
                {link.url}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Meetings */}
      <div>
        <h2 className="text-lg font-semibold mt-6 mb-2">Scheduled Meetings</h2>
        <div className="flex flex-col gap-3">
          {scheduledMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-slate-800 p-3 rounded flex flex-col"
            >
              <span className="font-medium">{meeting.title}</span>
              <span className="text-sm text-gray-400">{meeting.time}</span>
              <span className="text-sm text-gray-400">
                Participants: {meeting.participants.join(", ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
