"use client";

import Header from "@/app/components/Header";
import {
  AudioLines,
  Building,
  CalendarDays,
  ChevronLeft,
  LoaderCircle,
  MessageCircle,
  Plus,
  Send,
  Settings,
  User,
  X,
} from "lucide-react";
import {
  ChatContext,
  useConversationStore,
} from "@/store/useConversationStore";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { registerFCMToken } from "@/lib/firebase/registerFCMtoken";
import useUser from "@/hooks/useUser";
import createClient from "@/lib/supabase/client";

import { useMessages } from "@/hooks/useMessages";
import { useTypingStatus } from "@/hooks/useTypingStatus";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { useChatManager } from "@/hooks/useChatManager";
import { useFCM } from "@/hooks/useFCM";
import { useContacts } from "@/hooks/useContacts";
import TypingDots from "../components/TypingDots";
import { ConversationMessage } from "../components/ConversationMessage";
import ChatTopBar from "../components/ChatTopBar";
import Phone from "../components/Phone";
import dayjs from "dayjs";

export default function Home() {
  const { loading, error, user } = useUser();
  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  const {
    contacts,
    setContacts,
    showPhone,
    setShowPhone,
    selectedConversation,
    setSelectedConversation,
  } = useConversationStore();

  const [newMessage, setNewMessage] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const [activePanel, setActivePanel] = useState<
    "contacts" | "workspaces" | "settings" | "calendar"
  >("contacts");
  const [collapsed, setCollapsed] = useState(false);
  // const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  // const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
  //   null
  // );

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { messages, setMessages, messagesLoading } = useMessages(
    selectedConversation?.chat_id,
    user?.id
  );

  const { typingIndicator, updateTypingStatus } = useTypingStatus(
    selectedConversation?.chat_id,
    user?.id
  );

  const { handleSelectContact } = useChatManager(
    setSelectedConversation,
    setUnreadCounts
  );

  useRealtimeChat({
    userId: user?.id,
    selectedChatId: selectedConversation?.chat_id,
    setMessages,
    setUnreadCounts,
  });

  useFCM(user?.id);
  useContacts(setContacts);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        chat_id: selectedConversation.chat_id,
        content: newMessage.trim(),
        status: "sent",
      })
      .select();

    if (error) {
      console.error("❌ Error sending message:", error.message);
      return;
    }

    setNewMessage("");
    // ✅ Reset typing status after sending
    await supabase.from("typing_status").upsert({
      chat_id: selectedConversation.chat_id,
      user_id: user.id,
      is_typing: false,
      updated_at: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("✅ Message received from service worker:", event.data);
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <LoaderCircle className="animate-spin size-5" />
        <span>Loading user data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="font-sans h-full">
      <main
        className="flex flex-col w-full max-h-screen h-full"
        // data-lk-theme="default"
      >
        <Header />
        {/* 🧱 Split layout below */}
        <div className="flex min-h-0 flex-1 w-full">
          {/* Floating Phone Component */}
          {showPhone && (
            <div className="flex z-50 absolute bottom-5 right-5">
              <div className="flex flex-col w-fit h-fit bg-transparent">
                {/* Top bar with X icon aligned right */}
                <div className="flex justify-end">
                  <button
                    className="text-red-500 border border-zinc-800 rounded-full bg-zinc-950  cursor-pointer p-1"
                    onClick={() => setShowPhone(false)}
                  >
                    <X size={30} />
                  </button>
                </div>

                {/* Phone UI */}
                <Phone />
              </div>
            </div>
          )}

          {/* Sidebar / Inbox */}

          <div className="flex h-full">
            <NavigationRail
              activePanel={activePanel}
              setActivePanel={setActivePanel}
              collapsed={collapsed}
              toggleCollapsed={() => setCollapsed(!collapsed)}
            />
            {!collapsed && (
              <>
                {activePanel === "contacts" && (
                  <ContactsPanel
                    contacts={contacts}
                    unreadCounts={unreadCounts}
                    handleSelectContact={handleSelectContact}
                  />
                )}
                {activePanel === "workspaces" && (
                  <WorkspacePanel
                    workspaces={workspaces}
                    selectedWorkspace={selectedWorkspace}
                    setSelectedWorkspace={setSelectedWorkspace}
                  />
                )}
              </>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 flex flex-col justify-start bg-gradient-to-t from-slate-800 to-slate-950 text-white ">
            {activePanel === "calendar" ? (
              <CalendarView />
            ) : selectedConversation ? (
              <>
                <ChatTopBar />
                <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide gap-2 p-10">
                  {messagesLoading ? (
                    <div className="text-gray-400 text-sm">
                      Loading messages...
                    </div>
                  ) : user ? (
                    messages.map((msg) => (
                      <ConversationMessage
                        key={msg.id}
                        data={msg}
                        currentUserId={user.id}
                      />
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">User not loaded</div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* conversation */}
                <div className="flex flex-col w-full p-5">
                  {typingIndicator && <TypingDots />}

                  <div className="flex w-full items-center ">
                    {/* Audio icon (left) */}
                    <button className="">
                      <Plus
                        size={24}
                        className="cursor-pointer hover:opacity-50"
                      />
                    </button>

                    {/* Input field (center) */}
                    <div className="flex items-center justify-between flex-1 mx-2 border bg-slate-900 border-slate-600 rounded-full px-5 py-1 ">
                      <input
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          updateTypingStatus(e.target.value);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="w-full rounded-full outline-none"
                        placeholder="Message..."
                      />
                      {/* Plus icon (right) */}
                      <button className="">
                        <AudioLines
                          size={24}
                          className="cursor-pointer hover:opacity-50"
                        />
                      </button>
                      {/* ✅ Send button */}
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                      >
                        <Send
                          size={20}
                          className="cursor-pointer hover:opacity-50 rotate-45 ml-2"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 bg-zinc-950 text-white flex items-center justify-center h-full">
                <p className="">Please select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type PanelType = "contacts" | "workspaces" | "settings" | "calendar";

interface NavigationRailProps {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

function NavigationRail({
  activePanel,
  setActivePanel,
  collapsed,
  toggleCollapsed,
}: NavigationRailProps) {
  return (
    <div
      className={`bg-zinc-900 text-white flex flex-col items-center py-4 space-y-6 ${
        collapsed ? "w-16" : "w-20"
      } transition-all`}
    >
      <button onClick={() => setActivePanel("contacts")}>
        <MessageCircle
          className={`size-6 ${
            activePanel === "contacts" ? "text-blue-400" : "text-gray-400"
          }`}
        />
      </button>
      <button onClick={() => setActivePanel("workspaces")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          stroke={activePanel === "workspaces" ? "#60A5FA" : "#9CA3AF"} // Tailwind: blue-400 or gray-400
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
      <button onClick={() => setActivePanel("calendar")}>
        <CalendarDays
          className={`size-6 ${
            activePanel === "calendar" ? "text-blue-400" : "text-gray-400"
          }`}
        />
      </button>
      <button onClick={() => setActivePanel("settings")}>
        <Settings
          className={`size-6 ${
            activePanel === "settings" ? "text-blue-400" : "text-gray-400"
          }`}
        />
      </button>
      <button onClick={toggleCollapsed}>
        <ChevronLeft className={`size-6 ${collapsed ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

interface ContactEntry {
  contact: Contact;
  chat_id: string;
}

interface ContactsPanelProps {
  contacts: ContactEntry[];
  unreadCounts: Record<string, number>;
  handleSelectContact: (contact: Contact) => void;
}

function ContactsPanel({
  contacts,
  unreadCounts,
  handleSelectContact,
}: ContactsPanelProps) {
  return (
    <div className="w-[350px] bg-slate-950 text-white flex flex-col border-r border-slate-600 gap-5">
      <div className="flex-1 overflow-y-auto scrollbar-hide mt-5 gap-5 flex flex-col">
        {contacts.map(({ contact, chat_id }) => (
          <button
            key={contact.id}
            className="flex items-center gap-3 px-4 py-2 w-full hover:opacity-50 rounded cursor-pointer"
            onClick={() => handleSelectContact(contact)}
          >
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex gap-1 items-center">
              <span>{contact.name}</span>
              {unreadCounts[chat_id] > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCounts[chat_id]}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface Workspace {
  id: string;
  name: string;
}

interface WorkspacePanelProps {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace) => void;
}

function WorkspacePanel({
  workspaces,
  selectedWorkspace,
  setSelectedWorkspace,
}: WorkspacePanelProps) {
  return (
    <div className="w-[350px] bg-slate-950 text-white flex flex-col border-r border-slate-600 p-4 gap-4">
      <h2 className="text-lg font-semibold">Workspaces</h2>
      <div className="flex flex-col gap-2">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => setSelectedWorkspace(ws)}
            className={`px-4 py-2 rounded text-left hover:bg-slate-800 ${
              selectedWorkspace?.id === ws.id
                ? "bg-slate-800 text-blue-400"
                : "text-white"
            }`}
          >
            {ws.name}
          </button>
        ))}
      </div>
      <button className="mt-4 text-sm text-blue-400 hover:underline">
        + Create Workspace
      </button>
    </div>
  );
}

function CalendarView() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [startDate, setStartDate] = useState(dayjs());

  // Start of the week (Sunday)
  const startOfWeek = startDate.startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));

  // Generate time slots from 12am to 11pm
  const hours = Array.from({ length: 24 }, (_, i) =>
    dayjs().hour(i).format("ha")
  );

  const handlePrev = () => {
    setStartDate((prev) =>
      viewMode === "week" ? prev.subtract(7, "day") : prev.subtract(1, "month")
    );
  };

  const handleNext = () => {
    setStartDate((prev) =>
      viewMode === "week" ? prev.add(7, "day") : prev.add(1, "month")
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-slate-950 text-white">
      {/* Month Header */}
      <div className="text-center text-xl font-semibold py-4">
        {startDate.format("MMMM YYYY")}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-900">
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="px-3 py-1 text-sm bg-slate-800 rounded hover:bg-slate-700"
          >
            ← Prev
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1 text-sm bg-slate-800 rounded hover:bg-slate-700"
          >
            Next →
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "week" ? "bg-blue-500" : "bg-slate-800"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "month" ? "bg-blue-500" : "bg-slate-800"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Header: Days of Week */}
      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] border-b border-slate-700">
        <div className="bg-slate-900 p-2 text-sm font-semibold flex items-center justify-center">
          Time
        </div>
        {days.map((day) => (
          <div
            key={day.format("YYYY-MM-DD")}
            className="p-2 text-sm font-semibold text-center"
          >
            {day.format("ddd DD")}
          </div>
        ))}
      </div>

      {/* Body: Time Rows */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] border-b border-slate-700 h-16"
          >
            <div className="flex items-center justify-center text-xs text-gray-400 bg-slate-900">
              {hour}
            </div>
            {days.map((day) => (
              <div
                key={`${day.format("YYYY-MM-DD")}-${hour}`}
                className="border-l border-slate-800 hover:bg-slate-800 cursor-pointer p-1 flex"
              >
                <textarea
                  placeholder=""
                  className="w-full h-full resize-none bg-transparent text-white text-xs outline-none"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
