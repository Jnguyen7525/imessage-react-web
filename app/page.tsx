"use client";

import Header from "@/app/components/Header";
import Image from "next/image";
import { Message } from "./components/Message";
import { ConversationMessage } from "./components/ConversationMessage";
import { AudioLines, Plus } from "lucide-react";
import { conversationMessages, messagesArray } from "@/utils/messages";
import { useConversationStore } from "@/store/useConversationStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const setSelectedConversation = useConversationStore(
    (state) => state.setSelectedConversation
  );
  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );

  const showOptions = useConversationStore((state) => state.showOptions);

  // React.useEffect(() => {
  //   console.log("Selected conversation:", selectedConversation);
  // }, [selectedConversation]);

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

  const handleSelectMessage = (id: string) => {
    const selected = messagesArray.find((msg) => msg.id === id);
    console.log("Found selected:", selected); // ✅ Should log the object

    setSelectedConversation(selected);
    console.log("Selected conversation (after set):", selectedConversation);
    // router.push(`/message/${id}`);
  };

  useEffect(() => {
    console.log("Selected conversation (after set):", selectedConversation);
  }, [selectedConversation]);

  return (
    <div className="font-sans ">
      <main className="flex flex-col w-full max-h-screen">
        <Header />
        {/* 🧱 Split layout below */}
        <div className="flex min-h-0 flex-1 w-full">
          {/* Sidebar / Inbox */}
          <div className="w-[350px] bg-[#09090b] text-white flex flex-col py-5 px-5 border-r border-zinc-800 gap-5">
            {/* Scrollable message list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 gap-5 flex flex-col">
              {messagesArray.map((msg) => (
                <Message
                  key={msg.id}
                  data={msg}
                  onPress={() => handleSelectMessage(msg.id)}
                />
              ))}
            </div>
          </div>
          {/* Conversation Thread */}
          <div className="flex-1 flex flex-col justify-between bg-[#09090b] text-white p-10">
            {selectedConversation ? (
              <>
                {/* <div className="">{selectedConversation.name}</div> */}
                {/* {conversationMessages.map((msg) => (
                  <ConversationMessage key={msg.id} data={msg} />
                ))} */}
                <div className="flex flex-col overflow-y-auto scrollbar-hide gap-2">
                  {conversationMessages.map((msg) => (
                    <ConversationMessage key={msg.id} data={msg} />
                  ))}
                </div>

                <div className="flex sticky bottom-0 mt-5">
                  <div className="flex w-full items-center ">
                    {/* Audio icon (left) */}
                    <button className="">
                      <Plus
                        size={24}
                        color={"#851de0"}
                        className="cursor-pointer hover:opacity-50"
                      />
                    </button>

                    {/* Input field (center) */}
                    <div className="flex items-center justify-between flex-1 mx-2 border border-zinc-800 rounded-full px-5 py-1">
                      <input
                        className="w-full rounded-full outline-none"
                        // placeholderTextColor={colors.zinc[400]}
                        placeholder="Message"
                      />
                      {/* Plus icon (right) */}
                      <button className="">
                        <AudioLines
                          size={24}
                          color={"#851de0"}
                          className="cursor-pointer hover:opacity-50"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 bg-[#09090b] text-white flex items-center justify-center h-full">
                <p className="">Please select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
