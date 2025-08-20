"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { createAccount } from "@/api/auth";
import { LoaderPinwheel } from "lucide-react";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await createAccount({ email });

      if (res?.success) {
        setMessage("✅ Sign up successful! Please check your email.");
        setEmail("");
      } else {
        setMessage("❌ Something went wrong. Try again.");
      }

    } catch (err: any) {
      setMessage(`❌${err?.message}`||"❌ Failed to sign up. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col items-center w-full max-w-md space-y-3">
      <div className="relative flex items-center w-full">
        <input
          type="email"
          placeholder="What's your email?"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full pr-24 sm:pr-16 px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-lg text-gray-800 bg-white/80 backdrop-blur-md border-b-2 border-transparent focus:border-pink-500 rounded-2xl outline-none shadow-xl transition-all duration-300"
        />
        <Button
          type="submit"
          disabled={loading}
          className="absolute right-4 sm:right-5 text-xl sm:text-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition"
        >
          {loading ? <LoaderPinwheel className="animate-spin" /> : "➝"}
        </Button>
      </div>

      {message ? <p className="text-sm text-center text-red-700">{message}</p>: <p className="text-sm text-center opacity-0">Hide</p> }
    </form>
  );
};
