// import { NextResponse } from "next/server";
// import supabaseAdmin from "@/lib/supabase/admin";

// export async function POST(request: Request) {
//   console.log("🔔 Precheck login initiated");
//   const { email } = await request.json();
//   console.log("🔍 Precheck received for:", email);

//   if (!email) {
//     console.warn("🚫 Missing email in precheck");
//     return NextResponse.json({ error: "Missing email" }, { status: 400 });
//   }

//   const { data: user, error } = await supabaseAdmin
//     .from("users")
//     .select("id")
//     .eq("email", email)
//     .single();

//   if (error) {
//     console.error("❌ Supabase error during precheck:", error.message);
//   }

//   if (!user) {
//     console.warn("🚫 No public.users match for:", email);
//     return NextResponse.json(
//       { error: "No account found. Please sign up first." },
//       { status: 404 }
//     );
//   }

//   console.log("✅ Precheck passed for:", email);
//   return NextResponse.json({ success: true });
// }

import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";

export async function POST(request: Request) {
  console.log("🔔 Precheck login initiated");
  const { email } = await request.json();
  console.log("🔍 Precheck received for:", email);

  if (!email) {
    console.warn("🚫 Missing email in precheck");
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, confirmed_at")
    .eq("email", email)
    .single();

  if (error) {
    console.error(
      "❌ Supabase error during public.users check:",
      error.message
    );
  }

  if (!user) {
    console.warn("🚫 No public.users match for:", email);
    return NextResponse.json(
      { error: "No account found. Please sign up first." },
      { status: 404 }
    );
  }

  if (!user.confirmed_at) {
    console.warn("🚫 User has not confirmed email:", email);
    return NextResponse.json(
      { error: "Please confirm your email before logging in." },
      { status: 403 }
    );
  }

  console.log("✅ Precheck passed for:", email);
  return NextResponse.json({ success: true });
}
