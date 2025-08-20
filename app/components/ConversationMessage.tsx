// import { colors } from '@/theme/colors';
// import { conversationMessages } from '@/utils/messages';
// import { StyleSheet, Text, View } from "react-native";
// import { SvgXml } from "react-native-svg";
// import { colors } from "theme/color";
// import { conversationMessages } from "utils/messages";
import { conversationMessages } from "@/utils/messages";
import { curlLeft, curlRight } from "./ChatBubble";

type ConversationMessageProps = {
  data: (typeof conversationMessages)[0];
};

export const ConversationMessage = (props: ConversationMessageProps) => {
  return (
    <div
    // style={[
    //   styles.container,
    //   {
    //     alignSelf: props.data.amISender ? 'flex-end' : 'flex-start',
    //     backgroundColor: props.data.amISender ? colors.blue['normal'] : '#27272a',
    //     // borderColor: '#121435',
    //     // borderWidth: 1,
    //   },
    // ]}
    >
      {/* <SvgXml
        xml={props.data.amISender ? curlRight : curlLeft}
        width={20}
        height={20}
        style={props.data.amISender ? styles.curlRight : styles.curlLeft}
        color={props.data.amISender ? colors.blue["normal"] : "#27272a"} // ✅ dynamic color
      /> */}

      <p
        // style={[
        //   styles.text,
        //   {
        //     color: props.data.amISender ? '#ffff' : '#ffff',
        //   },
        // ]}
        className=""
      >
        {props.data.text}
      </p>
    </div>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     maxWidth: "80%",
//     backgroundColor: "red",
//     paddingHorizontal: 14,
//     paddingVertical: 7,
//     borderRadius: 99,
//     zIndex: 0,
//     justifyContent: "center",
//   },

//   text: {
//     fontSize: 16,
//     lineHeight: 22,
//     zIndex: 0,
//   },
//   curlRight: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     zIndex: 0,
//   },
//   curlLeft: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     zIndex: 0,
//   },
// });
