// import { NextRequest, NextResponse } from "next/server";
// import { sendFCM } from "@/lib/firebase/fcm";
// import { getFCMTokenForUser } from "@/lib/firebase/userStore";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const {
//     calleeId,
//     callerName,
//     callerAvatar,
//     roomName,
//     liveKitUrl,
//     audioOnly,
//   } = body;

//   const fcmToken = await getFCMTokenForUser(calleeId);
//   if (!fcmToken) {
//     return NextResponse.json({ error: "FCM token not found" }, { status: 404 });
//   }

//   await sendFCM(fcmToken, {
//     type: "incoming_call",
//     callerName,
//     callerAvatar,
//     roomName,
//     liveKitUrl,
//     audioOnly: audioOnly ? "true" : "false",
//   });

//   return NextResponse.json({ success: true });
// }

import { sendFCM } from "@/lib/firebase/fcm";
import { getFCMTokenForUser } from "@/lib/firebase/userStore";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    calleeId,
    callerName,
    callerAvatar,
    roomName,
    liveKitUrl,
    audioOnly,
  } = body;

  const fcmToken = await getFCMTokenForUser(calleeId);
  if (!fcmToken) {
    return NextResponse.json({ error: "FCM token not found" }, { status: 404 });
  }

  await sendFCM(fcmToken, {
    type: "incoming_call",
    callerName,
    callerAvatar,
    roomName,
    liveKitUrl,
    audioOnly: audioOnly ? "true" : "false",
  });

  return NextResponse.json({ success: true });
}
