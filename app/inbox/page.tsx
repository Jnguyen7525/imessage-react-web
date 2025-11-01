"use client";

import Header from "@/app/components/Header";
import {
  AudioLines,
  Building,
  ChevronLeft,
  LoaderCircle,
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
    "contacts" | "workspaces" | "settings"
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
          <div className="flex-1 flex flex-col justify-between bg-gradient-to-t from-slate-800 to-slate-950 text-white ">
            {selectedConversation ? (
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

function NavigationRail({
  activePanel,
  setActivePanel,
  collapsed,
  toggleCollapsed,
}) {
  return (
    <div
      className={`bg-zinc-900 text-white flex flex-col items-center py-4 space-y-6 ${
        collapsed ? "w-16" : "w-20"
      } transition-all`}
    >
      <button onClick={() => setActivePanel("contacts")}>
        <User
          className={`size-6 ${
            activePanel === "contacts" ? "text-blue-400" : "text-gray-400"
          }`}
        />
      </button>
      <button onClick={() => setActivePanel("workspaces")}>
        <Building
          className={`size-6 ${
            activePanel === "workspaces" ? "text-blue-400" : "text-gray-400"
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

function ContactsPanel({ contacts, unreadCounts, handleSelectContact }) {
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

function WorkspacePanel({
  workspaces,
  selectedWorkspace,
  setSelectedWorkspace,
}) {
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
