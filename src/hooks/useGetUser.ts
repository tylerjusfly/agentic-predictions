"use client";

import { IUser } from "@/api/auth";
import { LOCAL_USER_KEY } from "@/lib/constants";
import { useEffect, useState } from "react";

export function useGetUser() {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_USER_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }
  }, []);

  return user;
}
