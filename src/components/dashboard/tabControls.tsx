"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/dashboard" },
  { label: "Settings", icon: <Settings size={16} />, path: "/dashboard/settings" },
];

const HeaderNav: React.FC = React.memo(() => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 shadow-md my-4 rounded-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-lg font-bold text-gray-900">Agentic Predictions</div>

        <button
          aria-label="Toggle Menu"
          className="md:hidden flex items-center p-2 rounded-lg text-gray-700 hover:bg-red-100 transition"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.label}
                href={tab.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-red-600"
                    : "text-gray-700 hover:text-red-600"
                )}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
          open ? "max-h-40" : "max-h-0"
        )}
      >
        <div className="bg-white/70 backdrop-blur-md px-4 py-3 space-y-2 rounded-b-md shadow-inner">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.label}
                href={tab.path}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-red-100 text-red-600 font-semibold"
                    : "text-gray-700 hover:bg-red-50"
                )}
                onClick={() => setOpen(false)}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
});

HeaderNav.displayName = "HeaderNav";
export default HeaderNav;
