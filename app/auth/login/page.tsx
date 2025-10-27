"use client";
import createClient from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import Header from "../../components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { SIGNUP_PATH } from "@/app/constants/common";
import { GoogleIcon } from "@/app/constants/google-icon";

export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const errorMessage = searchParams.get("error");

  const handleLogin = async () => {
    setError(null);
    console.log("🔔 Attempting login with:", email);

    try {
      const precheck = await fetch("/api/precheck-login", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await precheck.json();
      console.log("📡 Precheck response:", result);

      if (!precheck.ok) {
        console.warn("🚫 Precheck failed:", result.error);
        setError(result.error || "Login not allowed.");
        return;
      }
    } catch (err) {
      console.error("❌ Precheck fetch or JSON parse failed:", err);
      setError("Unexpected error during precheck.");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Supabase login error:", error.message);
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please confirm your email before logging in.");
        } else {
          setError(error.message);
        }
        return;
      }

      console.log("✅ Supabase login succeeded. Redirecting to callback...");
      router.push(`/auth/callback?next=${encodeURIComponent(next)}&flow=login`);
    } catch (err) {
      console.error("❌ Login flow crashed:", err);
      setError("Unexpected error during login.");
    }
  };

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // ✅ Let callback enforce signup — no email needed here
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?next=${encodeURIComponent(next)}&flow=login`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setError("There was an error logging in with Google. Please try again.");
      console.error("Google login error:", error);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-t from-slate-800 to-slate-950">
      <Header />
      <div className="p-6 max-w-md mx-auto flex flex-col w-full h-full justify-center items-center">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        <input
          className="w-full mb-1  py-1 px-2 border-b"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-2 py-1 px-2 border-b"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="text-red-500 text-sm mb-2 w-full text-left">{error}</p>
        )}

        <button
          className="w-full bg-blue-600 text-white py-1 mb-2 rounded-lg cursor-pointer"
          onClick={handleLogin}
        >
          Login
        </button>

        <button
          className="w-full bg-zinc-800 text-white py-1 rounded-lg cursor-pointer flex items-center justify-center gap-3"
          onClick={loginWithGoogle}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <LoaderCircle className="animate-spin size-5" />
          ) : (
            <GoogleIcon />
          )}
          <span>Login with Google</span>
        </button>

        {errorMessage && (
          <p className="text-red-500 mt-4 text-sm text-center">
            {decodeURIComponent(errorMessage)}{" "}
            <Link
              href={SIGNUP_PATH}
              className="underline text-purple-500 hover:text-purple-400"
            >
              Sign up here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
