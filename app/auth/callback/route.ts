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

  if (flow === "link-google") {
    console.log("🔗 Google account linked successfully");
  }

  return NextResponse.redirect(`${origin}${next}`);
}
