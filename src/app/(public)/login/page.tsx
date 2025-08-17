"use client";
import { accessAccount } from "@/api/auth";
import { setCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, LoaderPinwheel } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { COOKIE_KEY, LOCAL_USER_KEY } from "@/lib/constants";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    passkey: "",
    email: ""
  });
  const [error, seterror] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  async function onSignIn() {
    if (!formData.email || !formData.passkey) {
      seterror("Empty field is not allowed");
      return;
    }

    try {
      seterror(null);
      setSubmitting(true);
      const resp = await accessAccount({ passkey: formData.passkey, email: formData.email });

      if (resp.success) {
        // Redirect
        const userData = resp.user;

        if (userData && userData.accessToken) {
          setCookie(COOKIE_KEY, userData.accessToken, {
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
            // httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            sameSite: "strict"
          });

          // set to local storage
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { accessToken, ...rest } = userData;
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(rest));
          }

          router.push("/dashboard");
        } else {
          console.log("Branch here");
          seterror("Sorry, Login failed due to user error.");
          setSubmitting(false);
        }
      }
    } catch (e: any) {
      console.log(e, "err");
      seterror(e?.message || "Sorry, Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2 leading-tight">
          Access <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">AI Predictions</span>
        </h1>

        <div className="px-4 sm:px-8 ">
          <div className="flex flex-col gap-4">
            {error ? (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            ) : (
              <p className="mt-1 opacity-0 text-xs text-red-600">Data is valid</p>
            )}
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              required
              onChange={handleChange}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f6661d] text-gray-800"
            />
            <Input
              type="text"
              name="passkey"
              required
              placeholder="Enter your passkey"
              value={formData.passkey}
              onChange={handleChange}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f6661d] text-gray-800"
            />
          </div>
          <div className="flex flex-col items-center sm:flex-row gap-4 mt-5 justify-center">
            <Button
              size="lg"
              className="primary-btn rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={onSignIn}
            >
              {submitting && <LoaderPinwheel className="animate-spin" />}
              Check Predictions
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </div>
  );
};

export default Login;
