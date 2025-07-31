import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const matchHistory = {
  Qarabag: ['D', 'W', 'W', 'W', 'W'],
  Shelbourne: ['W', 'L', 'D', 'D', 'W'],
};

const getBadgeColor = (result: string) => {
  switch (result) {
    case 'W':
      return 'bg-emerald-500 text-white';
    case 'D':
      return 'bg-yellow-500 text-black';
    case 'L':
      return 'bg-rose-500 text-white';
    default:
      return 'bg-gray-400';
  }
};