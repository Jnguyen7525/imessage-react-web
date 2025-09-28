import { sendFCM } from "@/lib/firebase/fcm";
import { getFCMTokenForUser } from "@/lib/firebase/userStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { callerId, roomName, manualCancel } = body;

  const fcmToken = await getFCMTokenForUser(callerId);
  if (!fcmToken) {
    return NextResponse.json(
      { error: "Caller FCM token not found" },
      { status: 404 }
    );
  }

  await sendFCM(fcmToken, {
    type: "call_declined",
    roomName,
    recipientId: callerId,
    manualCancel: manualCancel ? "false" : "true", // ✅ must be string
  });

  return NextResponse.json({ success: true });
}
