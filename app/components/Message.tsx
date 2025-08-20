// import { colors } from '@/theme/colors';
// import { messagesArray } from '@/utils/messages';
// import { useRouter } from 'expo-router';
// import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { colors } from 'theme/color';
// import { messagesArray } from 'utils/messages';

import { messagesArray } from "@/utils/messages";
import Image from "next/image";

type MessageProps = {
  data: (typeof messagesArray)[0];
  onPress?: () => void; // 👈 Add this prop
};

export const Message = ({ data, onPress }: MessageProps) => {
  return (
    <button className="flex w-full items-center gap-2">
      <Image src={data.avatar} className="w-12 h-12 rounded-full" alt="" />
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between w-full">
          <span className="">{data.name}</span>
          <span className="">{data.time}</span>
        </div>
        <p className="text-sm text-zinc-500 w-full text-left">
          {data.message}
        </p>
      </div>
    </button>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     gap: 12,
//     alignItems: "center",
//     // borderBottomWidth: 1,
//     // borderBottomColor: colors.zinc['200'],
//     // paddingBottom: 16,
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 45,
//     resizeMode: "cover",
//   },
//   textsContainer: {
//     flex: 1,
//   },
//   textsFirstRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   textSenderName: {
//     fontSize: 17,
//     // fontWeight: 'bold',
//     color: "#ffff",
//     lineHeight: 22,
//   },
//   textSentTime: {
//     fontSize: 15,
//     color: "#ffff",
//     lineHeight: 20,
//   },
//   textsMessagePreview: {
//     fontSize: 15,
//     color: colors.zinc["600"],
//     lineHeight: 20,
//   },
// });
