// import { saveFCMTokenForUser } from "@/lib/firebase/userStore";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { token } = body;

//   // Replace with your actual auth logic
//   const userId = "mock-user-id"; // You’ll want to extract this from cookies/session

//   await saveFCMTokenForUser(userId, token);
//   return NextResponse.json({ success: true });
// }

import { saveFCMTokenForUser } from "@/lib/firebase/userStore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token } = body;

  const userId = "john"; // Replace with real user ID from session/auth

  await saveFCMTokenForUser(userId, token);
  return NextResponse.json({ success: true });
}
