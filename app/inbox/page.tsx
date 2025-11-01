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
import CalendarView from "../components/CalendarView";
import NavigationRail from "../components/NavigationRail";
import ContactsPanel from "../components/ContactsPanel";
import WorkspacePanel, { Workspace } from "../components/WorkspacePanel";
import MeetingView from "../components/MeetingView";
import WorkspaceView from "../components/WorkspaceView";

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
    "contacts" | "workspaces" | "meetings" | "calendar"
  >("contacts");
  const [collapsed, setCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: "ws1", name: "Design Team" },
    { id: "ws2", name: "Marketing Hub" },
    { id: "ws3", name: "Client Projects" },
  ]);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );

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
            {activePanel === "workspaces" ? (
              selectedWorkspace ? (
                <WorkspaceView workspace={selectedWorkspace} />
              ) : (
                <div className="flex-1 bg-gradient-to-t from-slate-800 to-slate-950 text-white flex items-center justify-center h-full">
                  <p>Select a workspace to view</p>
                </div>
              )
            ) : activePanel === "meetings" ? (
              <MeetingView />
            ) : activePanel === "calendar" ? (
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
              <div className="flex-1 bg-gradient-to-t from-slate-800 to-slate-950 text-white flex items-center justify-center h-full">
                <p className="">Please select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
