import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getWinnerOrDraw = (score: string): "Home" | "Away" | "Draw" => {
  const [home, away] = score.split("-").map(Number);

  if (home > away) return "Home";
  if (away > home) return "Away";
  return "Draw";
};


// const matchHistory = {
//   Qarabag: ['D', 'W', 'W', 'W', 'W'],
//   Shelbourne: ['W', 'L', 'D', 'D', 'W'],
// };

// const getBadgeColor = (result: string) => {
//   switch (result) {
//     case 'W':
//       return 'bg-emerald-500 text-white';
//     case 'D':
//       return 'bg-yellow-500 text-black';
//     case 'L':
//       return 'bg-rose-500 text-white';
//     default:
//       return 'bg-gray-400';
//   }
// };

export const isCardExpired = (dateString: string) => {
  const [month, year] = dateString.split("/");

  const current = new Date();
  const currentMonth = current.getMonth() + 1; // 0-based
  const currentYear = current.getFullYear();

  const inputMonth = parseInt(month, 10);
  const inputYear = parseInt(year, 10);

  const isValid =
    !isNaN(inputMonth) &&
    !isNaN(inputYear) &&
    inputMonth >= 1 &&
    inputMonth <= 12 &&
    (inputYear > currentYear ||
      (inputYear === currentYear && inputMonth >= currentMonth));

  return isValid ;
}

export const extractMonthYear = (dateString: string) => {
  const [month, year] = dateString.split("/");
  return { month, year };
}

export function generatePassword(length: number = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}