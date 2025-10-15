// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";
// // import createClient from "@/lib/supabase/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);

//   // Extract auth code and optional redirect path
//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/";

//   if (code) {
//     const supabase = await createClient();

//     // Exchange the auth code for a session
//     const { error } = await supabase.auth.exchangeCodeForSession(code);

//     if (!error) {
//       // Redirect to the intended path or fallback to homepage
//       console.log("✅ Auth callback redirecting to:", `${origin}${next}`);

//       return NextResponse.redirect(`${origin}${next}`);
//     }
//   }

//   // Redirect to error page if code is missing or exchange fails
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }

// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);

//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/";
//   const flow = searchParams.get("flow") ?? "login";

//   if (code) {
//     const supabase = await createClient();
//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.exchangeCodeForSession(code);

//     if (!error && user) {
//       console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);

//       if (flow === "signup") {
//         // Optional: insert into profiles or users table
//         try {
//           await supabase.from("profiles").upsert({
//             id: user.id,
//             email: user.email,
//             created_at: new Date().toISOString(),
//           });
//           console.log("🆕 New user profile created");
//         } catch (err) {
//           console.error("⚠️ Error creating profile:", err);
//         }
//       }

//       console.log("➡️ Redirecting to:", `${origin}${next}`);
//       return NextResponse.redirect(`${origin}${next}`);
//     }

//     console.error("❌ Error exchanging code for session:", error);
//   }

//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }

// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);

//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/";
//   const flow = searchParams.get("flow") ?? "login";

//   if (code) {
//     const supabase = await createClient();
//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.exchangeCodeForSession(code);

//     if (!error && user) {
//       console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);

//       if (flow === "login") {
//         // Check if user already exists in your profiles table
//         const { data: profile } = await supabase
//           .from("users")
//           .select("id")
//           .eq("id", user.id)
//           .single();

//         if (!profile) {
//           console.log("🚫 Google login attempted by unregistered user");
//           const redirect = new URL(`${origin}/auth/login`);
//           redirect.searchParams.set(
//             "error",
//             "You need to sign up before logging in with Google."
//           );
//           return NextResponse.redirect(redirect);
//         }
//       }

//       if (flow === "signup") {
//         // Create profile entry if needed
//         await supabase.from("users").upsert({
//           id: user.id,
//           email: user.email,
//           name:
//             user.user_metadata?.full_name ??
//             user.user_metadata?.name ??
//             user.email?.split("@")[0], // fallback to email prefix
//         });
//         console.log("🆕 Created profile for new Google signup");
//         console.log("🆕 Creating user with:", {
//           id: user.id,
//           email: user.email,
//           name:
//             user.user_metadata?.full_name ??
//             user.user_metadata?.name ??
//             user.email?.split("@")[0],
//         });
//       }

//       return NextResponse.redirect(`${origin}${next}`);
//     }
//   }

//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }

import createClient from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const flow = searchParams.get("flow") ?? "login";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);

  // 🔄 Ensure profile exists in public.users
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // 🆕 Create fallback profile
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split("@")[0],
    });
    console.log("🆕 Fallback profile created for:", user.email);
  }

  // 🚫 Block login if profile was missing and flow is login
  if (flow === "login" && !profile) {
    console.log("🚫 Google login attempted by unregistered user");
    const redirect = new URL(`${origin}/auth/login`);
    redirect.searchParams.set(
      "error",
      "You need to sign up before logging in with Google."
    );
    return NextResponse.redirect(redirect);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
