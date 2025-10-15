"use client";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email to confirm your account");
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) alert(error.message);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="p-6 max-w-md mx-auto flex flex-col w-full h-full justify-center items-center">
        <h1 className="text-xl font-bold mb-4">Sign Up</h1>
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
          className="w-full bg-purple-600 text-white py-2 mb-2 rounded-lg cursor-pointer"
          onClick={handleSignup}
        >
          Sign Up
        </button>
        <button
          className="w-full bg-zinc-800 text-white py-2 rounded-lg cursor-pointer"
          onClick={handleGoogleSignup}
        >
          <span>Sign Up with Google</span>
        </button>
      </div>
    </div>
  );
}
