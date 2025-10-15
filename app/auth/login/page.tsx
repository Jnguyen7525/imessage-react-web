"use client";

import createClient from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import Header from "../../components/Header";
import { useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { SIGNUP_PATH } from "@/app/constants/common";

export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const errorMessage = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // redirectTo: `${window.location.origin}/auth/callback${
          //   next ? `?next=${encodeURIComponent(next)}` : ""
          // }`,
          redirectTo: `${
            window.location.origin
          }/auth/callback?next=${encodeURIComponent(next ?? "/")}&flow=login`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setError("There was an error logging in with Google. Please try again.");
      console.error("Error loging in with Google:", error);
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert("Logged in!");
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) alert(error.message);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="p-6 max-w-md mx-auto flex flex-col w-full h-full justify-center items-center">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          className="w-full mb-2 p-2 border-b"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 p-2 border-b"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-[#851de0] text-white py-2 mb-2 rounded-lg cursor-pointer"
          onClick={handleLogin}
        >
          Login
        </button>
        <button
          className="w-full bg-zinc-800 text-white py-2 rounded-lg cursor-pointer flex items-center justify-center gap-3"
          // onClick={handleGoogleLogin}
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

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="size-5"
  >
    <path
      fill="#fbc02d"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#e53935"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4caf50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1565c0"
      d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);
