"use client";

import Header from "@/app/components/Header";
import { Message } from "./components/Message";
import { ConversationMessage } from "./components/ConversationMessage";
import { AudioLines, LoaderCircle, Plus, X } from "lucide-react";
import { conversationMessages, messagesArray } from "@/utils/messages";
import { useConversationStore } from "@/store/useConversationStore";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { registerFCMToken } from "@/lib/firebase/registerFCMtoken";
import useUser from "@/hooks/useUser";
import createClient from "@/lib/supabase/client";
import ChatTopBar from "./components/ChatTopBar";
import Phone from "./components/Phone";

export default function Home() {
  const { loading, error, user } = useUser();

  const searchParams = useSearchParams();
  const participantName = searchParams.get("user") ?? "anonymous";

  const setSelectedConversation = useConversationStore(
    (state) => state.setSelectedConversation
  );
  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );

  const { contacts, setContacts, showPhone } = useConversationStore();

  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(messagesArray);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const handleSearch = () => {
    setMessages(
      messagesArray.filter(
        (message) =>
          message.name.toLowerCase().includes(search.toLowerCase()) ||
          message.message.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  // const handleSelectMessage = (id: string) => {
  //   const selected = messagesArray.find((msg) => msg.id === id);
  //   console.log("Found selected:", selected); // ✅ Should log the object

  //   setSelectedConversation(selected);
  //   // console.log("Selected conversation (after set):", selectedConversation);
  // };

  const handleSelectMessage = (id: string) => {
    const selected = contacts.find((msg) => msg.id === id);
    console.log("Found selected:", selected);
    if (selected) setSelectedConversation(selected);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      const supabase = createClient();

      // 🔍 Step 1: Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("❌ Error fetching current user:", userError.message);
        return;
      }

      if (!user) {
        console.warn("⚠️ No authenticated user found");
        return;
      }

      console.log("✅ Current user:", user.id, user.email);

      // 🔍 Step 2: Query other users
      const { data: users, error: queryError } = await supabase
        .from("users") // or "public.users" if that's your table
        .select("id, name, avatar_url")
        .neq("id", user.id);

      if (queryError) {
        console.error("❌ Supabase query error:", queryError.message);
        return;
      }

      if (!users || users.length === 0) {
        console.warn("⚠️ No other users returned from Supabase");
        return;
      }

      console.log("✅ Fetched users:", users);

      // 🔍 Step 3: Format and store
      const formatted = users.map((u) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar_url ?? "",
      }));

      console.log("✅ Formatted contacts:", formatted);
      setContacts(formatted);
    };

    fetchContacts();
  }, [setContacts]);

  // useEffect(() => {
  //   console.log("Selected conversation (after set):", selectedConversation);
  // }, [selectedConversation]);

  // Call registerFCMToken() when the user logs in or loads the app.
  // useEffect(() => {
  //   console.log("Registering FCM token for:", participantName);
  //   registerFCMToken(participantName);
  // }, [participantName]);

  useEffect(() => {
    const register = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn("⚠️ No authenticated user found for FCM registration");
        return;
      }

      const participantName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        "anonymous";

      const participantAvatar =
        user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "";

      console.log("Registering FCM token for:", user.id, participantName);

      await registerFCMToken(user.id); // ✅ Store by user.id
    };

    register();
  }, []);

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
                  <button className="text-red-500 border border-zinc-800 rounded-full bg-zinc-950  cursor-pointer p-1">
                    <X size={30} />
                  </button>
                </div>

                {/* Phone UI */}
                <Phone />
              </div>
            </div>
          )}

          {/* Sidebar / Inbox */}
          <div className="w-[350px] bg-zinc-950 text-white flex flex-col  border-r border-zinc-800 gap-5">
            {/* Scrollable message list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide mt-5 gap-5 flex flex-col">
              {/* {messagesArray.map((msg) => (
                <Message
                  key={msg.id}
                  data={msg}
                  onPress={() => handleSelectMessage(msg.id)}
                />
              ))} */}
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  className="flex items-center gap-3 px-4 py-2 w-full hover:opacity-50 rounded cursor-pointer"
                  onClick={() => handleSelectMessage(contact.id)}
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
                  <span>{contact.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Conversation Thread */}
          <div className="flex-1 flex flex-col justify-between bg-zinc-900 text-white ">
            {selectedConversation ? (
              <>
                <ChatTopBar />
                <div className="flex flex-col overflow-y-auto scrollbar-hide gap-2 p-10">
                  {conversationMessages.map((msg) => (
                    <ConversationMessage key={msg.id} data={msg} />
                  ))}
                </div>

                <div className="flex sticky bottom-0 mt-5 w-full flex-1 grow p-5">
                  <div className="flex w-full items-center ">
                    {/* Audio icon (left) */}
                    <button className="">
                      <Plus
                        size={24}
                        // color={"#851de0"}
                        className="cursor-pointer hover:opacity-50"
                      />
                    </button>

                    {/* Input field (center) */}
                    <div className="flex items-center justify-between flex-1 mx-2 border bg-zinc-950 border-zinc-800 rounded-full px-5 py-1 ">
                      <input
                        className="w-full rounded-full outline-none"
                        placeholder="Message..."
                      />
                      {/* Plus icon (right) */}
                      <button className="">
                        <AudioLines
                          size={24}
                          // color={"#851de0"}
                          className="cursor-pointer hover:opacity-50"
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
