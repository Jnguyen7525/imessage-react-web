// /app/api/send-ping/route.ts
import { sendFCM } from "@/lib/firebase/fcm";
import { getFCMTokenForUser } from "@/lib/firebase/userStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { calleeId } = body;

  const fcmToken = await getFCMTokenForUser(calleeId);
  if (!fcmToken) {
    console.warn("No FCM token found for:", calleeId);
    return NextResponse.json({ error: "FCM token not found" }, { status: 404 });
  }

  await sendFCM(fcmToken, {
    type: "ping",
    recipientId: calleeId,
    message: "Hello from backend",
  });

  return NextResponse.json({ success: true });
}
