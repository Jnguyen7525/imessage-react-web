// "use client";

// import Header from "@/app/components/Header";
// import { ConversationMessage } from "./components/ConversationMessage";
// import { AudioLines, LoaderCircle, Plus, Send, X } from "lucide-react";
// import {
//   ChatContext,
//   useConversationStore,
// } from "@/store/useConversationStore";

// import { useSearchParams } from "next/navigation";
// import React, { useEffect, useRef, useState } from "react";

// import { registerFCMToken } from "@/lib/firebase/registerFCMtoken";
// import useUser from "@/hooks/useUser";
// import createClient from "@/lib/supabase/client";
// import ChatTopBar from "./components/ChatTopBar";
// import Phone from "./components/Phone";
// import TypingDots from "./components/TypingDots";

// import { useMessages } from "@/hooks/useMessages";
// import { useTypingStatus } from "@/hooks/useTypingStatus";
// import { useRealtimeChat } from "@/hooks/useRealtimeChat";
// import { useChatManager } from "@/hooks/useChatManager";
// import { useFCM } from "@/hooks/useFCM";
// import { useContacts } from "@/hooks/useContacts";

// // type MessageType = {
// //   id: string;
// //   sender_id: string;
// //   chat_id: string;
// //   content: string;
// //   created_at: string;
// //   avatar_url?: string;
// //   status?: "sent" | "delivered" | "read";
// //   delivered_at?: string;
// //   read_at?: string;
// // };

// export default function Home() {
//   const { loading, error, user } = useUser();
//   const searchParams = useSearchParams();
//   const participantName = searchParams.get("user") ?? "anonymous";

//   const {
//     contacts,
//     setContacts,
//     showPhone,
//     setShowPhone,
//     selectedConversation,
//     setSelectedConversation,
//   } = useConversationStore();

//   // const [messages, setMessages] = useState<MessageType[]>([]);
//   // const [messagesLoading, setMessagesLoading] = useState(false);
//   const [newMessage, setNewMessage] = useState("");
//   // const [typingIndicator, setTypingIndicator] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   const { messages, setMessages, messagesLoading } = useMessages(
//     selectedConversation?.chat_id,
//     user?.id
//   );

//   const { typingIndicator, updateTypingStatus } = useTypingStatus(
//     selectedConversation?.chat_id,
//     user?.id
//   );

//   const { handleSelectContact } = useChatManager(
//     setSelectedConversation,
//     setUnreadCounts
//   );

//   useRealtimeChat({
//     userId: user?.id,
//     selectedChatId: selectedConversation?.chat_id,
//     setMessages,
//     setUnreadCounts,
//   });

//   useFCM(user?.id);
//   useContacts(setContacts);

//   useEffect(() => {
//     if (bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // const handleSelectContact = async (contact: {
//   //   id: string;
//   //   name: string;
//   //   avatar: string;
//   // }) => {
//   //   const chat_id = await findOrCreateChat(contact.id);
//   //   if (!chat_id) return;
//   //   setSelectedConversation({ contact, chat_id });
//   //   // reset unread count on opening chat

//   //   setUnreadCounts((prev) => ({
//   //     ...prev,
//   //     [chat_id]: 0,
//   //   }));
//   // };

//   const handleSend = async () => {
//     if (!newMessage.trim() || !selectedConversation) return;

//     const supabase = createClient();
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     if (!user) return;

//     const { data, error } = await supabase
//       .from("messages")
//       .insert({
//         sender_id: user.id,
//         chat_id: selectedConversation.chat_id,
//         content: newMessage.trim(),
//         status: "sent",
//       })
//       .select();

//     if (error) {
//       console.error("❌ Error sending message:", error.message);
//       return;
//     }

//     setNewMessage("");
//     // ✅ Reset typing status after sending
//     await supabase.from("typing_status").upsert({
//       chat_id: selectedConversation.chat_id,
//       user_id: user.id,
//       is_typing: false,
//       updated_at: new Date().toISOString(),
//     });
//   };

//   // async function findOrCreateChat(contactId: string): Promise<string | null> {
//   //   const supabase = createClient();
//   //   const {
//   //     data: { user },
//   //     error: userError,
//   //   } = await supabase.auth.getUser();

//   //   if (userError || !user) {
//   //     console.error("❌ Failed to get current user:", userError?.message);
//   //     return null;
//   //   }

//   //   const { data: contactChats, error: contactError } = await supabase
//   //     .from("chat_participants")
//   //     .select("chat_id")
//   //     .eq("user_id", contactId);

//   //   if (contactError || !contactChats) {
//   //     console.error("❌ Failed to get contact's chats:", contactError?.message);
//   //     return null;
//   //   }

//   //   const chatIds = contactChats.map((row) => row.chat_id);

//   //   const { data: sharedChats, error: sharedError } = await supabase
//   //     .from("chat_participants")
//   //     .select("chat_id")
//   //     .eq("user_id", user.id)
//   //     .in("chat_id", chatIds);

//   //   if (sharedError) {
//   //     console.error("❌ Failed to get shared chats:", sharedError.message);
//   //     return null;
//   //   }

//   //   if (sharedChats && sharedChats.length > 0) {
//   //     return sharedChats[0].chat_id;
//   //   }

//   //   return await createOneToOneChat(user.id, contactId);
//   // }

//   // async function createOneToOneChat(
//   //   userId: string,
//   //   contactId: string
//   // ): Promise<string | null> {
//   //   const supabase = createClient();

//   //   const { data: chatData, error: chatError } = await supabase
//   //     .from("chats")
//   //     .insert({})
//   //     .select()
//   //     .single();

//   //   if (chatError || !chatData) {
//   //     console.error("❌ Failed to create chat:", chatError?.message);
//   //     return null;
//   //   }

//   //   const { error: participantError } = await supabase
//   //     .from("chat_participants")
//   //     .insert([
//   //       { chat_id: chatData.id, user_id: userId },
//   //       { chat_id: chatData.id, user_id: contactId },
//   //     ]);

//   //   if (participantError) {
//   //     console.error("❌ Failed to add participants:", participantError.message);
//   //     return null;
//   //   }

//   //   return chatData.id;
//   // }

//   // useEffect(() => {
//   //   const fetchMessages = async () => {
//   //     if (!selectedConversation) return;

//   //     setMessagesLoading(true);
//   //     const supabase = createClient();
//   //     const {
//   //       data: { user },
//   //     } = await supabase.auth.getUser();
//   //     if (!user) return;

//   //     const { data, error } = await supabase
//   //       .from("messages")
//   //       .select("*")
//   //       .eq("chat_id", selectedConversation.chat_id)
//   //       .order("created_at", { ascending: true });

//   //     if (error) {
//   //       console.error("❌ Error fetching messages:", error.message);
//   //       setMessagesLoading(false);
//   //       return;
//   //     }

//   //     setMessages(data);
//   //     setMessagesLoading(false);
//   //   };

//   //   fetchMessages();
//   // }, [selectedConversation]);

//   // marks messages as read when opening a conversation
//   // useEffect(() => {
//   //   const markAsRead = async () => {
//   //     if (!selectedConversation || !user?.id) return;

//   //     const supabase = createClient();
//   //     console.log(
//   //       "📖 Marking messages as read for chat:",
//   //       selectedConversation.chat_id
//   //     );

//   //     const { error } = await supabase
//   //       .from("messages")
//   //       .update({ status: "read", read_at: new Date().toISOString() })
//   //       .eq("chat_id", selectedConversation.chat_id)
//   //       .neq("sender_id", user.id)
//   //       .is("read_at", null);

//   //     if (error) {
//   //       console.error("❌ Failed to mark as read:", error.message);
//   //       return;
//   //     }

//   //     setMessages((prev) =>
//   //       prev.map((m) =>
//   //         m.chat_id === selectedConversation.chat_id &&
//   //         m.sender_id !== user.id &&
//   //         !m.read_at
//   //           ? { ...m, status: "read", read_at: new Date().toISOString() }
//   //           : m
//   //       )
//   //     );
//   //   };

//   //   markAsRead();
//   // }, [selectedConversation, user]);

//   // marks incoming messages as read in while conversation is open
//   // useEffect(() => {
//   //   const markIncomingAsRead = async () => {
//   //     if (!selectedConversation || !user?.id || messages.length === 0) return;

//   //     const unread = messages.some(
//   //       (m) =>
//   //         m.chat_id === selectedConversation.chat_id &&
//   //         m.sender_id !== user.id &&
//   //         !m.read_at
//   //     );

//   //     if (!unread) return;

//   //     const supabase = createClient();
//   //     console.log("📖 Marking incoming messages as read (live)");

//   //     const { error } = await supabase
//   //       .from("messages")
//   //       .update({
//   //         status: "read",
//   //         read_at: new Date().toISOString(),
//   //       })
//   //       .eq("chat_id", selectedConversation.chat_id)
//   //       .neq("sender_id", user.id)
//   //       .is("read_at", null);

//   //     if (error) {
//   //       console.error("❌ Failed to mark incoming as read:", error.message);
//   //       return;
//   //     }
//   //     setMessages((prev) =>
//   //       prev.map((m) =>
//   //         m.chat_id === selectedConversation.chat_id &&
//   //         m.sender_id !== user.id &&
//   //         m.delivered_at &&
//   //         !m.read_at
//   //           ? { ...m, status: "read", read_at: new Date().toISOString() }
//   //           : m
//   //       )
//   //     );
//   //   };

//   //   markIncomingAsRead();
//   // }, [messages, selectedConversation, user]);

//   // useEffect(() => {
//   //   const supabase = createClient();
//   //   if (!user?.id) return;

//   //   console.log("🔔 Subscribing to realtime messages for user:", user.id);

//   //   const channel = supabase
//   //     .channel("messages")

//   //     // INSERT listener
//   //     .on(
//   //       "postgres_changes",
//   //       {
//   //         event: "INSERT",
//   //         schema: "public",
//   //         table: "messages",
//   //       },
//   //       async (payload) => {
//   //         const message = payload.new;
//   //         console.log(
//   //           "📥 Incoming message after sent:",
//   //           message,
//   //           message.created_at
//   //         );

//   //         // Check if current user is a participant
//   //         const { data: isParticipantData, error: participantError } =
//   //           await supabase
//   //             .from("chat_participants")
//   //             .select("chat_id")
//   //             .eq("chat_id", message.chat_id)
//   //             .eq("user_id", user.id);

//   //         if (
//   //           participantError ||
//   //           !isParticipantData ||
//   //           isParticipantData.length === 0
//   //         ) {
//   //           console.log("🚫 Message not for this user");
//   //           return;
//   //         }

//   //         const transformed: MessageType = {
//   //           id: message.id,
//   //           chat_id: message.chat_id,
//   //           sender_id: message.sender_id,
//   //           content: message.content,
//   //           created_at: message.created_at,
//   //           avatar_url: message.avatar_url ?? "",
//   //           status: message.status,
//   //           delivered_at: message.delivered_at,
//   //           read_at: message.read_at,
//   //         };

//   //         // Append to UI only if it's the active chat
//   //         if (message.chat_id === selectedConversation?.chat_id) {
//   //           console.log("✅ Message belongs to active chat");

//   //           setMessages((prev) =>
//   //             prev.some((m) => m.id === message.id)
//   //               ? prev
//   //               : [...prev, transformed]
//   //           );
//   //         } else {
//   //           console.log(
//   //             "🔕 Message for another chat — consider badge or toast"
//   //           );
//   //         }

//   //         // Always mark as delivered if receiver and not already delivered
//   //         if (message.sender_id !== user.id && !message.delivered_at) {
//   //           console.log("📦 Scheduling delivery update for:", message.id);

//   //           setTimeout(async () => {
//   //             const { data: current, error: fetchError } = await supabase
//   //               .from("messages")
//   //               .select("status, delivered_at, read_at")
//   //               .eq("id", message.id)
//   //               .single();

//   //             if (fetchError) {
//   //               console.error(
//   //                 "❌ Failed to fetch message before delivery update:",
//   //                 fetchError.message
//   //               );
//   //               return;
//   //             }

//   //             if (current.status === "read" || current.read_at) {
//   //               console.log(
//   //                 "⏭️ Skipping delivery update — already read:",
//   //                 message.id
//   //               );
//   //               return;
//   //             }

//   //             const { error: deliveryError } = await supabase
//   //               .from("messages")
//   //               .update({
//   //                 status: "delivered",
//   //                 delivered_at: new Date().toISOString(),
//   //               })
//   //               .eq("id", message.id)
//   //               .is("delivered_at", null);

//   //             if (deliveryError) {
//   //               console.error(
//   //                 "❌ Failed to mark as delivered:",
//   //                 deliveryError.message
//   //               );
//   //             } else {
//   //               console.log("✅ Message marked as delivered:", message.id);
//   //             }
//   //           }, 500);
//   //         }
//   //         // get unread count for badge
//   //         if (
//   //           message.sender_id !== user.id &&
//   //           !message.read_at &&
//   //           message.chat_id !== selectedConversation?.chat_id
//   //         ) {
//   //           setUnreadCounts((prev) => ({
//   //             ...prev,
//   //             [message.chat_id]: (prev[message.chat_id] || 0) + 1,
//   //           }));
//   //         }
//   //       }
//   //     )

//   //     // UPDATE listener
//   //     .on(
//   //       "postgres_changes",
//   //       {
//   //         event: "UPDATE",
//   //         schema: "public",
//   //         table: "messages",
//   //       },
//   //       (payload) => {
//   //         const updated = payload.new;
//   //         console.log("🔄 Message updated:", updated);

//   //         setMessages((prev) =>
//   //           prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
//   //         );
//   //       }
//   //     )

//   //     .subscribe();

//   //   return () => {
//   //     supabase.removeChannel(channel);
//   //   };
//   // }, [selectedConversation, user]);

//   // useEffect(() => {
//   //   const fetchContacts = async () => {
//   //     const supabase = createClient();

//   //     const {
//   //       data: { user },
//   //       error: userError,
//   //     } = await supabase.auth.getUser();

//   //     if (userError || !user) {
//   //       console.error("❌ Error fetching current user:", userError?.message);
//   //       return;
//   //     }

//   //     const { data: users, error: queryError } = await supabase
//   //       .from("users")
//   //       .select("id, name, avatar_url")
//   //       .neq("id", user.id);

//   //     if (queryError || !users) {
//   //       console.error("❌ Supabase query error:", queryError?.message);
//   //       return;
//   //     }

//   //     const formatted: ChatContext[] = await Promise.all(
//   //       users.map(async (u) => {
//   //         const chat_id = await findOrCreateChat(u.id);
//   //         return {
//   //           contact: {
//   //             id: u.id,
//   //             name: u.name,
//   //             avatar: u.avatar_url ?? "",
//   //           },
//   //           chat_id: chat_id ?? "", // fallback if null
//   //         };
//   //       })
//   //     );

//   //     setContacts(formatted);
//   //   };

//   //   fetchContacts();
//   // }, [setContacts]);

//   // useEffect(() => {
//   //   const register = async () => {
//   //     const supabase = createClient();
//   //     const {
//   //       data: { user },
//   //     } = await supabase.auth.getUser();

//   //     if (!user) {
//   //       console.warn("⚠️ No authenticated user found for FCM registration");
//   //       return;
//   //     }

//   //     const participantName =
//   //       user.user_metadata?.full_name ??
//   //       user.user_metadata?.name ??
//   //       "anonymous";

//   //     const participantAvatar =
//   //       user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? "";

//   //     console.log("Registering FCM token for:", user.id, participantName);

//   //     await registerFCMToken(user.id); // ✅ Store by user.id
//   //   };

//   //   register();
//   // }, []);

//   // async function updateTypingStatus({
//   //   message,
//   //   chat_id,
//   //   user_id,
//   // }: {
//   //   message: string;
//   //   chat_id: string;
//   //   user_id: string;
//   // }) {
//   //   if (!chat_id || !user_id) {
//   //     console.warn("⚠️ Missing chat_id or user_id");
//   //     return;
//   //   }

//   //   const supabase = createClient();
//   //   const isTyping = message.trim().length > 0;

//   //   const { error } = await supabase.from("typing_status").upsert({
//   //     chat_id,
//   //     user_id,
//   //     is_typing: isTyping,
//   //     updated_at: new Date().toISOString(),
//   //   });

//   //   if (error) {
//   //     console.error("❌ Failed to update typing status:", error.message);
//   //   } else {
//   //     console.log(`✅ Typing status set to ${isTyping}`);
//   //   }
//   // }

//   // useEffect(() => {
//   //   const supabase = createClient();
//   //   if (!user?.id || !selectedConversation?.chat_id) return;

//   //   console.log(
//   //     "📝 Subscribing to typing status for chat:",
//   //     selectedConversation.chat_id
//   //   );

//   //   const typingChannel = supabase
//   //     .channel("typing_status")
//   //     .on(
//   //       "postgres_changes",
//   //       {
//   //         event: "INSERT",
//   //         schema: "public",
//   //         table: "typing_status",
//   //       },
//   //       (payload) => {
//   //         const { chat_id, user_id, is_typing } = payload.new;
//   //         if (chat_id === selectedConversation.chat_id && user_id !== user.id) {
//   //           console.log("💬 Typing status inserted:", user_id, is_typing);
//   //           setTypingIndicator(is_typing);
//   //         }
//   //       }
//   //     )
//   //     .on(
//   //       "postgres_changes",
//   //       {
//   //         event: "UPDATE",
//   //         schema: "public",
//   //         table: "typing_status",
//   //       },
//   //       (payload) => {
//   //         const { chat_id, user_id, is_typing } = payload.new;
//   //         if (chat_id === selectedConversation.chat_id && user_id !== user.id) {
//   //           console.log("💬 Typing status updated:", user_id, is_typing);
//   //           setTypingIndicator(is_typing);
//   //         }
//   //       }
//   //     )
//   //     .subscribe();

//   //   return () => {
//   //     supabase.removeChannel(typingChannel);
//   //   };
//   // }, [selectedConversation?.chat_id, user]);

//   useEffect(() => {
//     if (typeof window !== "undefined" && navigator.serviceWorker) {
//       navigator.serviceWorker.addEventListener("message", (event) => {
//         console.log("✅ Message received from service worker:", event.data);
//       });
//     }
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center space-x-2 text-gray-500">
//         <LoaderCircle className="animate-spin size-5" />
//         <span>Loading user data...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
//         <p>Error: {error.message}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="font-sans h-full">
//       <main
//         className="flex flex-col w-full max-h-screen h-full"
//         // data-lk-theme="default"
//       >
//         <Header />
//         {/* 🧱 Split layout below */}
//         <div className="flex min-h-0 flex-1 w-full">
//           {/* Floating Phone Component */}
//           {showPhone && (
//             <div className="flex z-50 absolute bottom-5 right-5">
//               <div className="flex flex-col w-fit h-fit bg-transparent">
//                 {/* Top bar with X icon aligned right */}
//                 <div className="flex justify-end">
//                   <button
//                     className="text-red-500 border border-zinc-800 rounded-full bg-zinc-950  cursor-pointer p-1"
//                     onClick={() => setShowPhone(false)}
//                   >
//                     <X size={30} />
//                   </button>
//                 </div>

//                 {/* Phone UI */}
//                 <Phone />
//               </div>
//             </div>
//           )}

//           {/* Sidebar / Inbox */}
//           <div className="w-[350px] bg-slate-950 text-white flex flex-col  border-r border-slate-600 gap-5">
//             {/* Scrollable message list */}
//             <div className="flex-1 overflow-y-auto scrollbar-hide mt-5 gap-5 flex flex-col">
//               {contacts.map(({ contact, chat_id }) => (
//                 <button
//                   key={contact.id}
//                   className="flex items-center gap-3 px-4 py-2 w-full hover:opacity-50 rounded cursor-pointer"
//                   onClick={() => handleSelectContact(contact)}
//                 >
//                   {contact.avatar ? (
//                     <img
//                       src={contact.avatar}
//                       alt={contact.name}
//                       className="w-8 h-8 rounded-full"
//                     />
//                   ) : (
//                     <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
//                       {contact.name.charAt(0).toUpperCase()}
//                     </div>
//                   )}
//                   <span className="flex gap-1 items-center">
//                     <span>{contact.name}</span>
//                     {unreadCounts[chat_id] > 0 && (
//                       <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
//                         {unreadCounts[chat_id]}
//                       </span>
//                     )}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>
//           {/* Conversation Thread */}
//           <div className="flex-1 flex flex-col justify-between bg-gradient-to-t from-slate-800 to-slate-950 text-white ">
//             {selectedConversation ? (
//               <>
//                 <ChatTopBar />
//                 <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide gap-2 p-10">
//                   {messagesLoading ? (
//                     <div className="text-gray-400 text-sm">
//                       Loading messages...
//                     </div>
//                   ) : user ? (
//                     messages.map((msg) => (
//                       <ConversationMessage
//                         key={msg.id}
//                         data={msg}
//                         currentUserId={user.id}
//                       />
//                     ))
//                   ) : (
//                     <div className="text-gray-400 text-sm">User not loaded</div>
//                   )}
//                   <div ref={bottomRef} />
//                 </div>

//                 <div className="flex flex-col w-full p-5">
//                   {typingIndicator && <TypingDots />}

//                   <div className="flex w-full items-center ">
//                     {/* Audio icon (left) */}
//                     <button className="">
//                       <Plus
//                         size={24}
//                         className="cursor-pointer hover:opacity-50"
//                       />
//                     </button>

//                     {/* Input field (center) */}
//                     <div className="flex items-center justify-between flex-1 mx-2 border bg-slate-900 border-slate-600 rounded-full px-5 py-1 ">
//                       <input
//                         value={newMessage}
//                         // onChange={(e) => {
//                         //   setNewMessage(e.target.value);
//                         //   user?.id &&
//                         //     updateTypingStatus({
//                         //       message: e.target.value,
//                         //       chat_id: selectedConversation.chat_id,
//                         //       user_id: user.id,
//                         //     });
//                         // }}
//                         onChange={(e) => {
//                           setNewMessage(e.target.value);
//                           updateTypingStatus(e.target.value);
//                         }}
//                         onKeyDown={(e) => e.key === "Enter" && handleSend()}
//                         className="w-full rounded-full outline-none"
//                         placeholder="Message..."
//                       />
//                       {/* Plus icon (right) */}
//                       <button className="">
//                         <AudioLines
//                           size={24}
//                           className="cursor-pointer hover:opacity-50"
//                         />
//                       </button>
//                       {/* ✅ Send button */}
//                       <button
//                         onClick={handleSend}
//                         disabled={!newMessage.trim()}
//                       >
//                         <Send
//                           size={20}
//                           className="cursor-pointer hover:opacity-50 rotate-45 ml-2"
//                         />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 bg-zinc-950 text-white flex items-center justify-center h-full">
//                 <p className="">Please select a conversation</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

"use client";

import Header from "@/app/components/Header";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans overflow-y-auto">
      {/* ✅ Header */}
      <Header />

      {/* ✅ Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl font-bold mb-4">
          The All-In-One Workspace for Real-Time Collaboration
        </h1>
        <p className="text-lg text-gray-400 max-w-xl">
          Host secure video calls, message your team, and stay connected — all
          in one place. Built for remote work, client meetings, and modern
          workflows.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex gap-4">
          <Link href="/inbox">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold">
              Try It Free
            </button>
          </Link>
          <button className="border border-gray-500 px-6 py-3 rounded-full font-semibold text-gray-300 hover:text-white">
            Watch Demo
          </button>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-12">
          <div className="mt-12 relative w-[600px] h-[350px] rounded-lg overflow-hidden bg-gray-800">
            <Image
              src="/livekit-meet.jpg"
              alt="Video call UI"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ✅ Features Section */}
      <section className="px-6 py-20 bg-zinc-900">
        <h2 className="text-3xl font-bold text-center mb-12">
          Trusted by Teams, Loved by Clients
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <Feature
            icon="🎥"
            title="Meet Face-to-Face"
            description="Launch HD video calls with instant connection and crystal-clear quality."
          />
          <Feature
            icon="🎙️"
            title="Stay Connected on the Go"
            description="Switch to audio-only mode for low-bandwidth or mobile-friendly meetings."
          />
          <Feature
            icon="📱"
            title="Works on Every Device"
            description="Responsive layouts for mobile, tablet, and desktop — no downloads required."
          />
          <Feature
            icon="🔐"
            title="Enterprise-Grade Security"
            description="Manual onboarding, token enforcement, and profile checks — no ghost logins."
          />
          <Feature
            icon="💬"
            title="Integrated Messaging"
            description="Chat before, during, and after calls with real-time delivery and read receipts."
          />
          <Feature
            icon="🛠️"
            title="Scales With Your Business"
            description="Modular architecture built for teams of 2 or 2000."
          />
        </div>
      </section>

      {/* ✅ Industry Use Cases */}
      <section className="px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Built for Every Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <Feature
            icon="👩‍💻"
            title="Remote Teams"
            description="Daily standups, async check-ins, and real-time collaboration — all in one place."
          />
          <Feature
            icon="🎓"
            title="Education & Training"
            description="Host live classes, share materials, and keep students engaged."
          />
          <Feature
            icon="🧑‍⚕️"
            title="Consulting & Coaching"
            description="Meet clients securely, share insights, and follow up instantly."
          />
          <Feature
            icon="🎨"
            title="Creative Collaboration"
            description="Review designs, brainstorm ideas, and iterate together in real time."
          />
          <Feature
            icon="🏢"
            title="Enterprise & Ops"
            description="Manage teams, onboard staff, and streamline internal communication."
          />
        </div>
      </section>

      {/* ✅ Visual Showcase */}
      <section className="px-6 py-20 bg-zinc-900">
        <h2 className="text-3xl font-bold text-center mb-12">
          See It In Action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-800 rounded-lg h-[300px] flex items-center justify-center text-gray-500">
            [Insert Video Call UI Screenshot]
          </div>
          <div className="bg-gray-800 rounded-lg h-[300px] flex items-center justify-center text-gray-500">
            [Insert Messaging Thread with Read Receipts]
          </div>
        </div>
      </section>

      {/* ✅ Testimonials */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
          <Testimonial
            name="Sarah M."
            role="Startup Founder"
            quote="This platform replaced three tools for our team. Calls are smooth, messaging is instant, and onboarding is seamless."
          />
          <Testimonial
            name="David L."
            role="Design Lead"
            quote="We use it daily for client reviews and internal syncs. The UI feels native and the read receipts are a game changer."
          />
          <Testimonial
            name="Priya K."
            role="Educator"
            quote="I host live classes and chat with students in real time. It’s reliable, secure, and easy for everyone to use."
          />
        </div>
      </section>

      {/* ✅ Pricing Tiers */}
      <section className="px-6 py-20 bg-zinc-900 text-center">
        <h2 className="text-3xl font-bold mb-12">
          Simple Pricing for Every Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <PricingTier
            name="Starter"
            price="$0"
            description="Perfect for individuals and small teams"
            features={[
              "Up to 5 users",
              "Video & audio calls",
              "Messaging & read receipts",
            ]}
          />
          <PricingTier
            name="Pro"
            price="$12/user/mo"
            description="For growing teams and client-facing workflows"
            features={[
              "Unlimited users",
              "Priority support",
              "Custom branding",
            ]}
          />
          <PricingTier
            name="Enterprise"
            price="Custom"
            description="Tailored for large organizations"
            features={[
              "SSO & compliance",
              "Dedicated onboarding",
              "Custom integrations",
            ]}
          />
        </div>
      </section>

      {/* ✅ CTA Section */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Work Smarter?</h2>
        <p className="text-gray-400 mb-8">
          Whether you're hosting a client call or syncing with your team, our
          platform keeps you connected and productive.
        </p>
        <Link href="/inbox">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold">
            Try It Now
          </button>
        </Link>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-zinc-900 text-gray-400 text-sm text-center py-6 border-t border-zinc-800">
        <p>
          © {new Date().getFullYear()} TIM. Built for modern teams, remote work,
          and real-time collaboration.
        </p>
        <p className="mt-2">Video • Audio • Messaging • Secure • Scalable</p>
      </footer>
    </div>
  );
}

/* ✅ Reusable Feature Block */
function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

/* ✅ Reusable Testimonial Block */
function Testimonial({
  name,
  role,
  quote,
}: {
  name: string;
  role: string;
  quote: string;
}) {
  return (
    <div className="bg-zinc-800 p-6 rounded-lg">
      <p className="text-gray-300 italic">“{quote}”</p>
      <p className="mt-4 font-semibold">{name}</p>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  );
}

/* ✅ Reusable Pricing Tier Block */
function PricingTier({
  name,
  price,
  description,
  features,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="bg-zinc-800 p-6 rounded-lg flex flex-col items-center text-left">
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <p className="text-blue-400 text-3xl font-semibold mb-2">{price}</p>
      <p className="text-gray-400 mb-4 text-center">{description}</p>
      <ul className="text-sm text-gray-300 space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-green-400">✔</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button className="mt-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-semibold">
        Get Started
      </button>
    </div>
  );
}
