// // import { colors } from '@/theme/colors';
// // import { conversationMessages } from '@/utils/messages';
// // import { StyleSheet, Text, View } from "react-native";
// // import { SvgXml } from "react-native-svg";
// // import { colors } from "theme/color";
// // import { conversationMessages } from "utils/messages";
// import { conversationMessages } from "@/utils/messages";
// import { curlLeft, curlRight } from "./ChatBubble";

// type ConversationMessageProps = {
//   data: (typeof conversationMessages)[0];
// };

// export const ConversationMessage = (props: ConversationMessageProps) => {
//   return (
//     <div
//     // style={[
//     //   styles.container,
//     //   {
//     //     alignSelf: props.data.amISender ? 'flex-end' : 'flex-start',
//     //     backgroundColor: props.data.amISender ? colors.blue['normal'] : '#27272a',
//     //     // borderColor: '#121435',
//     //     // borderWidth: 1,
//     //   },
//     // ]}
//     >
//       {/* <SvgXml
//         xml={props.data.amISender ? curlRight : curlLeft}
//         width={20}
//         height={20}
//         style={props.data.amISender ? styles.curlRight : styles.curlLeft}
//         color={props.data.amISender ? colors.blue["normal"] : "#27272a"} // ✅ dynamic color
//       /> */}

//       <p
//         // style={[
//         //   styles.text,
//         //   {
//         //     color: props.data.amISender ? '#ffff' : '#ffff',
//         //   },
//         // ]}
//         className=""
//       >
//         {props.data.text}
//       </p>
//     </div>
//   );
// };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     maxWidth: "80%",
// //     backgroundColor: "red",
// //     paddingHorizontal: 14,
// //     paddingVertical: 7,
// //     borderRadius: 99,
// //     zIndex: 0,
// //     justifyContent: "center",
// //   },

// //   text: {
// //     fontSize: 16,
// //     lineHeight: 22,
// //     zIndex: 0,
// //   },
// //   curlRight: {
// //     position: "absolute",
// //     bottom: 0,
// //     right: 0,
// //     zIndex: 0,
// //   },
// //   curlLeft: {
// //     position: "absolute",
// //     bottom: 0,
// //     left: 0,
// //     zIndex: 0,
// //   },
// // });

// import { conversationMessages } from "@/utils/messages";
// import { CurlLeft, CurlRight } from "./ChatBubble";

// type ConversationMessageProps = {
//   data: (typeof conversationMessages)[0];
// };

// export const ConversationMessage = ({ data }: ConversationMessageProps) => {
//   // console.log("ConversationMessage data:", data);
//   const isSender = data.amISender;
//   const Curl = isSender ? CurlRight : CurlLeft;

//   return (
//     <div
//       className={`relative max-w-[80%] px-[14px] py-[7px] rounded-full z-0 ${
//         isSender ? "self-end bg-blue-600" : "self-start bg-zinc-800"
//       }`}
//     >
//       {/* SVG curl */}
//       <div
//         className={`absolute -bottom-1 ${
//           isSender ? "-right-0.5 text-blue-600" : "-left-0.5 text-zinc-800"
//         } z-0`}
//       >
//         <Curl />
//       </div>

//       {/* Message text */}
//       <p className="text-white text-[16px] leading-[22px] z-20">{data.text}</p>
//     </div>
//   );
// };

// import { CurlLeft, CurlRight } from "./ChatBubble";

// type MessageType = {
//   id: string;
//   sender_id: string;
//   receiver_id: string;
//   content: string;
//   created_at: string;
//   avatar_url?: string;
// };

// type ConversationMessageProps = {
//   data: MessageType;
//   currentUserId: string;
// };

// export const ConversationMessage = ({
//   data,
//   currentUserId,
// }: ConversationMessageProps) => {
//   const isSender = data.sender_id === currentUserId;
//   const Curl = isSender ? CurlRight : CurlLeft;

//   return (
//     <div
//       className={`relative max-w-[80%] px-[14px] py-[7px] rounded-full z-0 ${
//         isSender ? "self-end bg-blue-600" : "self-start bg-zinc-800"
//       }`}
//     >
//       {/* SVG curl */}
//       <div
//         className={`absolute -bottom-1 ${
//           isSender ? "-right-0.5 text-blue-600" : "-left-0.5 text-zinc-800"
//         } z-0`}
//       >
//         <Curl />
//       </div>

//       {/* Message text */}
//       <p className="text-white text-[16px] leading-[22px] z-20">
//         {data.content}
//       </p>
//     </div>
//   );
// };

import { CurlLeft, CurlRight } from "./ChatBubble";
import dayjs from "dayjs";

type MessageType = {
  id: string;
  sender_id: string;
  // !doesn't seem like were using receiver_id anywhere, but keeping for now
  chat_id: string;
  content: string;
  created_at: string;
  avatar_url?: string;
  status?: "sent" | "delivered" | "read";
};

type ConversationMessageProps = {
  data: MessageType;
  currentUserId: string;
};

export const ConversationMessage = ({
  data,
  currentUserId,
}: ConversationMessageProps) => {
  const isSender = data.sender_id === currentUserId;
  const Curl = isSender ? CurlRight : CurlLeft;

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}>
      {!isSender && data.avatar_url && (
        <img
          src={data.avatar_url}
          alt="avatar"
          className="w-6 h-6 rounded-full mr-2 self-end"
        />
      )}

      <div
        className={`relative max-w-[80%] px-[14px] py-[7px] rounded-full z-0 text-white text-[16px] leading-[22px] ${
          isSender ? "bg-blue-600" : "bg-zinc-800"
        }`}
      >
        <div
          className={`absolute -bottom-1 ${
            isSender ? "-right-0.5 text-blue-600" : "-left-0.5 text-zinc-800"
          } z-0`}
        >
          <Curl />
        </div>
        <p>{data.content}</p>
        <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
          <span>{dayjs(data.created_at).format("HH:mm")}</span>
          {isSender && (
            // <span>
            //   {data.status === "sent" && "✓ Sent"}
            //   {data.status === "delivered" && "✓✓ Delivered"}
            //   {data.status === "read" && "✓✓✓ Read"}
            // </span>
            <span className="text-xs text-gray-400">
              {data.status === "read"
                ? "✓✓ Read"
                : data.status === "delivered"
                ? "✓✓ Delivered"
                : "✓ Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
