"use client";

import React, { useState } from "react";
import { CheckCircle, LoaderPinwheel, XCircle } from "lucide-react";
import { IUser } from "@/api/auth";
import { COOKIE_KEY, LOCAL_USER_KEY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import moment from 'moment';
import { Button } from "@/components/ui/button";

const Settings = () => {
  const router = useRouter();
  const userData: IUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem(LOCAL_USER_KEY) || "{}") : {};

  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const userEmail = userData?.email ?? "";
  const isVerified = false;
  const subscribed = userData?.subscribed === 1;
  
  const registrationDate = moment(userData?.subsribed_at|| "");
  const expirationDate = registrationDate.clone().add(1, 'month').startOf('month');
  const subscriptionExpires = expirationDate.format('YYYY-MM-DD HH:mm:ss');

  const handleLogout = () => {
    setLoggingOut(true)
    document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem(LOCAL_USER_KEY);
    router.push("/login");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-[#1e1b3a] rounded-2xl shadow-md p-6 space-y-6 text-white">
      <div className="flex justify-between mb-4 border-b border-[#2a2550] pb-2">
        <h2 className="text-2xl font-bold">Account Settings</h2>
         <Button
              size="lg"
              className="w-24 transition"
              onClick={handleLogout}
              variant="destructive"
            >
              {loggingOut && <LoaderPinwheel className="animate-spin" />}
              Logout
            </Button>
      </div>

      {/* Email & Verification */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Email</p>
          <p className="font-semibold">{userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <>
              <CheckCircle className="text-green-500 w-5 h-5" />
              <span className="text-green-400 text-sm">Verified</span>
            </>
          ) : (
            <>
              <XCircle className="text-red-500 w-5 h-5" />
              <span className="text-red-400 text-sm">Unverified</span>
            </>
          )}
        </div>
      </div>

      {/* Subscription */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Subscription Expires</p>
          <p className="font-semibold">{subscriptionExpires === "Invalid date"? "Free Tier": subscriptionExpires}</p>
        </div>
        <button
          disabled={subscribed}
          className={`px-5 py-2 rounded-md font-semibold transition ${
            subscribed
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          }`}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
