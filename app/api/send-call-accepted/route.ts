import { sendFCM } from "@/lib/firebase/fcm";
import { getFCMTokenForUser } from "@/lib/firebase/userStore";
import createClient from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { callerId, roomName, liveKitUrl, callerToken, callerName, audioOnly } =
    body;

  const fcmToken = await getFCMTokenForUser(callerId);

  console.log("🔍 Looking up FCM token for recipientId:", callerId);

  if (!fcmToken) {
    console.warn("❌ No FCM token found for callerId:", callerId);

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

  const payload = {
    type: "call_accepted",
    roomName,
    liveKitUrl,
    callerToken,
    callerName,
    audioOnly: audioOnly ? "true" : "false",
    recipientId: callerId,
  };

  console.log("📦 Sending call_accepted payload:", payload);

  await sendFCM(fcmToken, payload);
  console.log("📨 FCM push dispatched to caller");

  return NextResponse.json({ success: true });
}
