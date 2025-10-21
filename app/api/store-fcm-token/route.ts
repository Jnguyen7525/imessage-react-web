// import { saveFCMTokenForUser } from "@/lib/firebase/userStore";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { token } = body;

//   const url = new URL(req.url);
//   const userId = url.searchParams.get("user") ?? "anonymous";

//   console.log("Received token for user:", userId);
//   console.log("Token:", token);

//   const { error } = await saveFCMTokenForUser(userId, token);

//   if (error) {
//     console.error("Supabase insert error:", error);
//     return NextResponse.json(
//       { error: "Failed to store token" },
//       { status: 500 }
//     );
//   }

//   return NextResponse.json({ success: true });
// }

import createClient from "@/lib/supabase/server";
import { saveFCMTokenForUser } from "@/lib/firebase/userStore";
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
  const { token } = body;

  const userId = user.id;
  console.log("Received token for user:", userId);
  console.log("Token:", token);

  const { error: insertError } = await saveFCMTokenForUser(userId, token);

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to store token" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
