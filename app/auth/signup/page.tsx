"use client";
import createClient from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import Header from "../../components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { LOGIN_PATH } from "@/app/constants/common";
import { GoogleIcon } from "@/app/constants/google-icon";

export default function SignupPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createClient();
  const router = useRouter();

  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const handleSignup = async () => {
    setError(null);
    console.log("🔔 Attempting signup with:", { email, name });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      console.error("❌ Signup error:", error.message);
      setError(error.message);
      return;
    }

    console.log("✅ Signup initiated. Awaiting email confirmation.");
    alert("Check your email to confirm your account.");
    router.push(LOGIN_PATH);
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?next=${encodeURIComponent(next ?? "/")}&flow=signup`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google signup error:", error);
      setError("There was an error signing up with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950">
      <Header />
      <div className="p-6 max-w-md mx-auto flex flex-col w-full h-full justify-center items-center">
        <h1 className="text-xl font-bold mb-4">Sign Up</h1>
        <input
          className="w-full mb-2 py-1 px-2 border-b"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full mb-2 py-1 px-2 border-b"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 py-1 px-2 border-b"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2 w-full text-left">{error}</p>
        )}

        <button
          className="w-full bg-blue-600 text-white py-1 px-2  mb-2 rounded-lg cursor-pointer"
          onClick={handleSignup}
        >
          Sign Up
        </button>

        <button
          className="w-full bg-zinc-800 text-white py-1 px-2  rounded-lg cursor-pointer flex items-center justify-center gap-3"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <LoaderCircle className="animate-spin size-5" />
          ) : (
            <GoogleIcon />
          )}
          <span>Sign Up with Google</span>
        </button>
      </div>
    </div>
  );
}
