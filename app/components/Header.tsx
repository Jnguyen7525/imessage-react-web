"use client";

import { useConversationStore } from "@/store/useConversationStore";
import { Ellipsis, Phone, Video } from "lucide-react";
import Image from "next/image";
import React from "react";

function Header() {
  const toggleShowOptions = useConversationStore(
    (state) => state.toggleShowOptions
  );

  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");

  // const { id } = useGlobalSearchParams();

  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );

  // Optional debug
  React.useEffect(() => {
    console.log("Selected (via useMemo):", selectedConversation);
  }, [selectedConversation]);
  return (
    <div className="bg-[#09090b] w-full h-fit p-5 gap-12 flex text-white items-center border-b border-zinc-800">
      <div>
        {selectedConversation ? (
          <div className="">
            <Image className="" src={selectedConversation.avatar} alt="" />
            <span className="">{selectedConversation.name}</span>
          </div>
        ) : (
          <span className="">Messages</span>
        )}
      </div>
      <div className="border-2 border-[#27272a] h-fit w-fit rounded-full px-2 py-1 flex-1 mx-4">
        <input className="" placeholder="search..." />
      </div>
      <div className="flex gap-4 text-[#851de0]">
        <Phone />
        <Video />
        <Ellipsis />
      </div>
    </div>
  );
}

export default Header;
