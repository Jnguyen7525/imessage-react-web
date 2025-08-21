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
    <div className="bg-[#09090b] w-full h-fit px-5 py-3 gap-12 flex text-white items-center border-b border-zinc-800">
      <div className="">
        {selectedConversation ? (
          <div className="flex items-center gap-2">
            <Image
              className="w-12 h-12 rounded-full"
              src={selectedConversation.avatar}
              alt=""
            />
            <span className="">{selectedConversation.name}</span>
          </div>
        ) : (
          <span className="">Messages</span>
        )}
      </div>
      <div className="border-1 border-[#27272a] h-fit w-fit rounded-full  flex-1 mx-4">
        <input
          className="px-4 py-1 w-full rounded-full"
          placeholder="Search..."
        />
      </div>
      <div className="flex gap-4 text-[#851de0]">
        <Phone
          className={`${
            selectedConversation ? "cursor-pointer hover:opacity-50" : "hidden"
          }`}
        />
        <Video
          className={`${
            selectedConversation ? "cursor-pointer hover:opacity-50" : "hidden"
          }`}
        />
        <Ellipsis className="cursor-pointer hover:opacity-50" />
      </div>
    </div>
  );
}

export default Header;
