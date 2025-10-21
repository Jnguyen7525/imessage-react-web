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
  const {
    calleeId,
    callerId,
    callerName,
    callerAvatar,
    roomName,
    liveKitUrl,
    audioOnly,
    callerToken, // ✅ Add this
  } = body;

  console.log("Sending call invite to:", calleeId);
  const fcmToken = await getFCMTokenForUser(calleeId);

  if (!fcmToken) {
    console.warn("No FCM token found for:", calleeId);
    return NextResponse.json({ error: "FCM token not found" }, { status: 404 });
  }

  console.log("FCM token found:", fcmToken);
  console.log("Sending payload:", {
    type: "incoming_call",
    callerName,
    callerId,
    callerAvatar: JSON.stringify(callerAvatar),
    roomName,
    liveKitUrl,
    audioOnly: audioOnly ? "true" : "false",
    recipientId: calleeId,
  });

  await sendFCM(fcmToken, {
    type: "incoming_call",
    callerName,
    callerId,
    callerAvatar: JSON.stringify(callerAvatar), // ✅ serialize to string
    roomName,
    liveKitUrl,
    audioOnly: audioOnly ? "true" : "false",
    recipientId: String(calleeId),
    callerToken: String(callerToken), // ✅ Force to string
  });

  return NextResponse.json({ success: true });
}
