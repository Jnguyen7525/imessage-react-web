import { sendFCM } from "@/lib/firebase/fcm";
import { getFCMTokenForUser } from "@/lib/firebase/userStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { callerId, roomName, liveKitUrl, callerToken, callerName, audioOnly } =
    body;

  const fcmToken = await getFCMTokenForUser(callerId);
  if (!fcmToken) {
    return NextResponse.json(
      { error: "Caller FCM token not found" },
      { status: 404 }
    );
  }

  await sendFCM(fcmToken, {
    type: "call_accepted",
    roomName,
    liveKitUrl,
    callerToken,
    callerName,
    audioOnly: audioOnly ? "true" : "false",
    recipientId: callerId,
  });

  return NextResponse.json({ success: true });
}
