// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);

//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/";
//   const flow = searchParams.get("flow") ?? "login";

//   if (!code) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   const supabase = await createClient();
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.exchangeCodeForSession(code);

//   if (error || !user) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);

//   // 🔄 Ensure profile exists in public.users
//   const { data: profile } = await supabase
//     .from("users")
//     .select("id")
//     .eq("id", user.id)
//     .single();

//   if (!profile) {
//     // 🆕 Create fallback profile
//     await supabase.from("users").upsert({
//       id: user.id,
//       email: user.email,
//       name:
//         user.user_metadata?.full_name ??
//         user.user_metadata?.name ??
//         user.email?.split("@")[0],
//     });
//     console.log("🆕 Fallback profile created for:", user.email);
//   }

//   // 🚫 Block login if profile was missing and flow is login
//   if (flow === "login" && !profile) {
//     console.log("🚫 Google login attempted by unregistered user");
//     const redirect = new URL(`${origin}/auth/login`);
//     redirect.searchParams.set(
//       "error",
//       "You need to sign up before logging in with Google."
//     );
//     return NextResponse.redirect(redirect);
//   }

//   if (flow === "link-google") {
//     console.log("🔗 Google account linked successfully");
//   }

//   return NextResponse.redirect(`${origin}${next}`);
// }

// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);

//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/";
//   const flow = searchParams.get("flow") ?? "login";

//   if (!code) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   const supabase = await createClient();
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.exchangeCodeForSession(code);

//   if (error || !user) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);

//   const { data: profile } = await supabase
//     .from("users")
//     .select("id")
//     .eq("id", user.id)
//     .single();

//   // 🚫 Block login if profile is missing
//   if (!profile && flow === "login") {
//     console.log("🚫 Google login attempted by unregistered user");
//     const redirect = new URL(`${origin}/auth/login`);
//     redirect.searchParams.set(
//       "error",
//       "You need to sign up before logging in with Google."
//     );
//     return NextResponse.redirect(redirect);
//   }

//   // ✅ Only create fallback profile if flow is NOT login
//   if (!profile && flow !== "login") {
//     await supabase.from("users").upsert({
//       id: user.id,
//       email: user.email,
//       name:
//         user.user_metadata?.full_name ??
//         user.user_metadata?.name ??
//         user.email?.split("@")[0],
//     });
//     console.log("🆕 Fallback profile created for:", user.email);
//   }

//   if (flow === "link-google") {
//     console.log("🔗 Google account linked successfully");
//   }

//   return NextResponse.redirect(`${origin}${next}`);
// }

// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);

//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/";
//   const flow = searchParams.get("flow") ?? "login";

//   if (!code) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   const supabase = await createClient();
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.exchangeCodeForSession(code);

//   if (error || !user) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);

//   // 🔍 Check if profile exists
//   const { data: profile } = await supabase
//     .from("users")
//     .select("id")
//     .eq("id", user.id)
//     .single();

//   // 🚫 Block login if profile is missing
//   if (!profile && flow === "login") {
//     console.log("🚫 Google login attempted by unregistered user");

//     // Optional: delete orphaned auth.users row
//     await supabase.auth.admin.deleteUser(user.id);

//     const redirect = new URL(`${origin}/auth/login`);
//     redirect.searchParams.set(
//       "error",
//       "You need to sign up before logging in with Google."
//     );
//     return NextResponse.redirect(redirect);
//   }

//   // ✅ Create profile only during signup or linking
//   if (!profile && (flow === "signup" || flow === "link-google")) {
//     await supabase.from("users").insert({
//       id: user.id,
//       email: user.email,
//       name:
//         user.user_metadata?.full_name ??
//         user.user_metadata?.name ??
//         user.email?.split("@")[0],
//     });
//     console.log("🆕 Fallback profile created for:", user.email);
//   }

//   if (flow === "link-google") {
//     console.log("🔗 Google account linked successfully");
//   }

//   return NextResponse.redirect(`${origin}${next}`);
// }

// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);

//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/";
//   const flow = searchParams.get("flow") ?? "login";

//   if (!code) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   const supabase = await createClient();
//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.exchangeCodeForSession(code);

//   if (error || !user) {
//     return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//   }

//   console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);

//   // 🔍 Check if profile exists
//   const { data: profile, error: profileError } = await supabase
//     .from("users")
//     .select("id")
//     .eq("id", user.id)
//     .single();

//   if (profileError) {
//     console.error("Error checking profile:", profileError);
//   }

//   // 🚫 Block login if profile is missing
//   if (!profile && flow === "login") {
//     console.log("🚫 Login attempted by unregistered user:", user.email);

//     // Optional: delete orphaned auth.users row
//     try {
//       await supabase.auth.admin.deleteUser(user.id);
//       console.log("🧹 Orphaned auth.users row deleted:", user.id);
//     } catch (deleteError) {
//       console.error("Failed to delete orphaned user:", deleteError);
//     }

//     const redirect = new URL(`${origin}/auth/login`);
//     redirect.searchParams.set(
//       "error",
//       "You need to sign up before logging in."
//     );
//     return NextResponse.redirect(redirect);
//   }

//   // ✅ Create profile only during signup or linking
//   if (!profile && (flow === "signup" || flow === "link-google")) {
//     const fallbackName =
//       user.user_metadata?.full_name ??
//       user.user_metadata?.name ??
//       user.email?.split("@")[0];

//     const { error: insertError } = await supabase.from("users").insert({
//       id: user.id,
//       email: user.email,
//       name: fallbackName,
//     });

//     if (insertError) {
//       console.error("❌ Failed to create public.users profile:", insertError);
//       const redirect = new URL(`${origin}/auth/login`);
//       redirect.searchParams.set(
//         "error",
//         "Signup succeeded but profile creation failed."
//       );
//       return NextResponse.redirect(redirect);
//     }

//     console.log("🆕 Fallback profile created for:", user.email);
//   }

//   if (flow === "link-google") {
//     console.log("🔗 Google account linked successfully");
//   }

//   return NextResponse.redirect(`${origin}${next}`);
// }

// import createClient from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   // const next = searchParams.get("next") ?? "/";
//   const rawNext = searchParams.get("next");
//   const next = rawNext?.startsWith("/api") ? "/" : rawNext ?? "/";
//   const flow = searchParams.get("flow") ?? "login";

//   console.log("🔔 Callback triggered:", { code, flow, next });

//   const supabase = await createClient();
//   let user;

//   if (code) {
//     // ✅ OAuth flow (Google)
//     const {
//       data: { user: oauthUser },
//       error,
//     } = await supabase.auth.exchangeCodeForSession(code);

//     if (error || !oauthUser) {
//       console.error("❌ Session exchange failed:", error?.message);
//       return NextResponse.redirect(`${origin}/auth/auth-code-error`);
//     }

//     user = oauthUser;
//     console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);
//   } else {
//     // ✅ Email/password flow
//     const { data: sessionData, error: sessionError } =
//       await supabase.auth.getSession();

//     if (sessionError || !sessionData.session?.user) {
//       console.error("❌ Failed to get session:", sessionError?.message);
//       console.log("🔁 Redirecting to next:", next);
//       return NextResponse.redirect(`${origin}/auth/login`);
//     }

//     user = sessionData.session.user;
//     console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);
//   }

//   // 🔍 Check if profile exists
//   const { data: profile, error: profileError } = await supabase
//     .from("users")
//     .select("id")
//     .eq("id", user.id)
//     .single();

//   if (profileError) {
//     console.error("⚠️ Error checking profile:", profileError.message);
//   }

//   if (!profile) {
//     console.log("🆕 No profile found. Creating fallback profile...");

//     const fallbackName =
//       user.user_metadata?.full_name ??
//       user.user_metadata?.name ??
//       user.email?.split("@")[0];

//     if (flow === "login" && !user.confirmed_at) {
//       console.warn("🚫 Email/password user not confirmed:", user.email);
//       const redirect = new URL(`${origin}/auth/login`);
//       redirect.searchParams.set(
//         "error",
//         "Please confirm your email before logging in."
//       );
//       return NextResponse.redirect(redirect);
//     }

//     const { error: insertError } = await supabase.from("users").insert({
//       id: user.id,
//       email: user.email,
//       name: fallbackName,
//     });

//     if (insertError) {
//       console.error("❌ Failed to create profile:", insertError.message);
//       const redirect = new URL(`${origin}/auth/login`);
//       redirect.searchParams.set(
//         "error",
//         "Login succeeded but profile creation failed."
//       );
//       return NextResponse.redirect(redirect);
//     }

//     console.log("✅ Fallback profile created for:", user.email);
//   } else {
//     console.log("✅ Profile already exists for:", user.email);
//   }

//   if (flow === "link-google") {
//     console.log("🔗 Google account linked successfully");
//   }

//   console.log("🚀 Redirecting to:", next);
//   return NextResponse.redirect(`${origin}${next}`);
// }

import createClient from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next = rawNext?.startsWith("/api") ? "/" : rawNext ?? "/";
  const flow = searchParams.get("flow") ?? "login";

  console.log("🔔 Callback triggered:", { code, flow, next });

  const supabase = await createClient();
  let user;

  if (code) {
    const {
      data: { user: oauthUser },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !oauthUser) {
      console.error("❌ Session exchange failed:", error?.message);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    user = oauthUser;
    console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);
  } else {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.user) {
      console.error("❌ Failed to get session:", sessionError?.message);
      return NextResponse.redirect(`${origin}/auth/login`);
    }

    user = sessionData.session.user;
    console.log(`✅ ${flow.toUpperCase()} flow for user:`, user.email);
  }

  if (flow === "login" && !user.confirmed_at) {
    console.warn("🚫 Email/password user not confirmed:", user.email);
    const redirect = new URL(`${origin}/auth/login`);
    redirect.searchParams.set(
      "error",
      "Please confirm your email before logging in."
    );
    return NextResponse.redirect(redirect);
  }

  // ✅ Profile creation handled by trigger — no manual insert needed
  console.log("🚀 Redirecting to:", next);
  return NextResponse.redirect(`${origin}${next}`);
}
