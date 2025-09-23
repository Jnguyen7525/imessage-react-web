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

import { conversationMessages } from "@/utils/messages";
import { CurlLeft, CurlRight } from "./ChatBubble";

type ConversationMessageProps = {
  data: (typeof conversationMessages)[0];
};

export const ConversationMessage = ({ data }: ConversationMessageProps) => {
  // console.log("ConversationMessage data:", data);
  const isSender = data.amISender;
  const Curl = isSender ? CurlRight : CurlLeft;

  return (
    <div
      className={`relative max-w-[80%] px-[14px] py-[7px] rounded-full z-0 ${
        isSender ? "self-end bg-blue-600" : "self-start bg-zinc-800"
      }`}
    >
      {/* SVG curl */}
      <div
        className={`absolute -bottom-1 ${
          isSender ? "-right-0.5 text-blue-600" : "-left-0.5 text-zinc-800"
        } z-0`}
      >
        <Curl />
      </div>

      {/* Message text */}
      <p className="text-white text-[16px] leading-[22px] z-20">{data.text}</p>
    </div>
  );
};
