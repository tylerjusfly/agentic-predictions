import { ChampionsLeagueIcon } from "@/icons/ChampionsLeague";
import { PremierLeagueIcon } from "@/icons/PremierLeague";
import { Gamepad, Zap } from "lucide-react";
import { SignupForm } from "./Form";


export default function EmailInput() {
  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-56 h-56 sm:w-80 sm:h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse -translate-x-1/2 -translate-y-1/2"></div>

      {/* Floating Icons */}
      <PremierLeagueIcon className="absolute top-20 left-1/4 w-16 h-16 text-pink-400 opacity-40 animate-pulse" />
      <Gamepad className="absolute top-32 right-1/4 w-16 h-16 text-pink-400 opacity-40 animate-bounce" />
      <Zap className="absolute bottom-32 left-1/4 w-14 h-14 text-orange-400 opacity-50 animate-pulse" />
      <ChampionsLeagueIcon className="absolute bottom-32 right-1/4 w-14 h-14 text-pink-400 opacity-50 animate-pulse" />

      <div className="relative flex flex-col items-center space-y-6 sm:space-y-8 z-10 px-4 sm:px-0">
        
        <h2 className="text-gray-800 text-lg sm:text-xl font-semibold text-center drop-shadow-md">
          Give us your email, let’s open an account for you.
        </h2>

        <SignupForm/>
        
      </div>
    </div>
  );
}
