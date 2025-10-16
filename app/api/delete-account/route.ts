import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const userId = body.userId;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // ✅ 1. Delete from auth.users
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
    userId
  );
  if (authError) {
    console.error("❌ Failed to delete user from auth:", authError.message);
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // ✅ 2. Delete from public.users
  const { error: profileError } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", userId);
  if (profileError) {
    console.error("❌ Failed to delete user profile:", profileError.message);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // ✅ 3. Delete avatar from storage
  const { error: storageError } = await supabaseAdmin.storage
    .from("avatars")
    .remove([`${userId}/avatar.png`]);
  if (storageError) {
    console.warn("⚠️ Failed to delete avatar:", storageError.message);
    // Not fatal — we still return success
  }

  console.log("✅ Fully deleted user:", userId);
  return NextResponse.json({ success: true });
}
