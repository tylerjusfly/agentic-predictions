"use client";

import React, { useState } from "react";
import {
  User,
  Headphones,
  Info,
  ChevronDown,
  LoaderPinwheel,
} from "lucide-react";
import PasswordChange from "@/components/settings/PasswordChange";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { COOKIE_KEY, LOCAL_USER_KEY } from "@/lib/constants";
import Controls from "@/components/settings/Controls";

const settingsOptions = [
  { 
    label: "Account", 
    icon: User,
    content: (
      <PasswordChange />
    )
  },
  { 
    label: "Help and Support", 
    icon: Headphones,
    content: (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Contact Support</h3>
          <p className="text-sm text-gray-600">Email us at tylerjusfly1@gmail.com</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">FAQs</h3>
          <p className="text-sm text-gray-600">Visit our FAQ page for quick answers</p>
        </div>
      </div>
    )
  },
  { 
    label: "Controls", 
    icon: Info,
    content: (
      <Controls/>
    )
  },
];

const Settings = () => {
  const router = useRouter();
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

    const handleLogout = () => {
    setLoggingOut(true)
    document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem(LOCAL_USER_KEY);
    router.push("/login");
  };

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  return (
    <div className="w-full max-w-xl lg:max-w-2xl mx-auto mt-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:bg-[#1e1b3a] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Settings</h2>
        {/* <div className="w-6" /> spacer */}
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

      {/* Options */}
      <div className="divide-y">
        {settingsOptions.map((item, idx) => {
          const Icon = item.icon;
          const isOpen = openSection === idx;
          
          return (
            <div key={idx}>
              <button
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition group"
              >
                <div className="flex items-center gap-3">
                  <Icon strokeWidth={1.5} className="w-6 h-6 text-gray-700 group-hover:text-red-600" />
                  <span className="text-sm font-medium group-hover:text-red-600">{item.label}</span>
                </div>
                <ChevronDown 
                  strokeWidth={1.5} 
                  className={`w-5 h-5 text-gray-500 group-hover:text-red-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}>
                <div className="border-t">
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;

