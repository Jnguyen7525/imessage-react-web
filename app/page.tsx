"use client";

import Header from "@/app/components/Header";
import Image from "next/image";
import { Message } from "./components/Message";
import { ConversationMessage } from "./components/ConversationMessage";
import { AudioLines, Plus } from "lucide-react";
import { conversationMessages, messagesArray } from "@/utils/messages";
import { useConversationStore } from "@/store/useConversationStore";
import { useState } from "react";

export default function Home() {
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
    setSelectedConversation(selected);
    // router.push(`/message/${id}`);
  };
  return (
    <div className="font-sans ">
      <main className="flex flex-col w-full min-h-screen">
        <Header />
        {/* 🧱 Split layout below */}
        <div className="flex h-full flex-1 w-full">
          {/* Sidebar / Inbox */}
          <div className="w-[350px] bg-[#09090b] text-white flex flex-col py-5 px-5 border-r border-zinc-800 gap-5">
            {messagesArray.map((msg) => (
              <Message
                key={msg.id}
                data={msg}
                onPress={() => handleSelectMessage(msg.id)}
              />
            ))}
          </div>
          {/* Conversation Thread */}
          <div className="flex-1 bg-[#09090b] text-white p-5">
            {selectedConversation ? (
              <>
                {/* <Text className=""={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#fff' }}>
                {selectedConversation.name}
              </Text> */}
                {conversationMessages.map((msg) => (
                  <ConversationMessage key={msg.id} data={msg} />
                ))}

                <div className="">
                  <div className="">
                    {/* Audio icon (left) */}
                    <button className="">
                      <Plus size={24} color={"#851de0"} />
                    </button>

                    {/* Input field (center) */}
                    <div className="">
                      <input
                        className=""
                        // placeholderTextColor={colors.zinc[400]}
                        placeholder="Message"
                      />
                      {/* Plus icon (right) */}
                      <button className="">
                        <AudioLines size={24} color={"#851de0"} />
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
