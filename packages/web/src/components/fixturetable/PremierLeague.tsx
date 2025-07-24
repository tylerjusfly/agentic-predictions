"use client";

import { getPremierLeagues, IPrediction } from "@/src/api/predictions";
import React, { useEffect, useState } from "react";
import { siPremierleague } from "simple-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import PublicFixtureTableSkeleton from "../skeletons/PublicFixtureTableSkeleton";

function PremierLeagueIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill={`#fff`} width={24} height={24} className="mr-2">
      <title>{siPremierleague.title}</title>
      <path d={siPremierleague.path} />
    </svg>
  );
}

const PremierLeague = () => {
  const [games, setGames] = useState<IPrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchGames() {
    try {
      const response = await getPremierLeagues();

      if (response.games) {
        setGames(response.games || []);
      }
    } catch (e: any) {
      console.log(e, "err");
      // setError(e.message || 'An error occurred');
      // setSubmitting(false);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <TooltipProvider>
      <div className="bg-[#0e0b2b] text-white rounded-xl overflow-hidden max-w-full shadow-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a2550]">
          <div className="flex items-center">
            <PremierLeagueIcon /> <span className="text-sm font-medium text-white">England Premier League </span>
          </div>
          <button className="text-white text-sm opacity-80">AI Confidence Level</button>
        </div>

        <div className="divide-y divide-[#2a2550]">
          {/* <!-- Repeat this block for each game --> */}
          {loading ? (
            <>
             <PublicFixtureTableSkeleton/>
             <PublicFixtureTableSkeleton/>
             <PublicFixtureTableSkeleton/>
             <PublicFixtureTableSkeleton/>
             <PublicFixtureTableSkeleton/>
            </>
          ) : (
            <>
              {games.map((game) => (
                <div key={game.id} className="flex items-center px-6 py-4 hover:bg-[#19143d] transition">
                  <div className="w-32 text-sm text-gray-300">
                    {game.time}
                    <div className="text-xs text-[#87a1d1]">{game.date}</div>
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-semibold text-white">{game.home_team}</span>
                    <span className="text-[#7b6cbf] font-bold">VS</span>
                    <span className="font-semibold text-white">{game.away_team}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#1f1a42] text-sm px-3 py-1 rounded-md text-white">{game.confidence_level}</div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="ml-4 text-white opacity-40 cursor-pointer">🔒</div>
                    </TooltipTrigger>
                    <TooltipContent side="top">Subscribe to PRO to access predictions</TooltipContent>
                  </Tooltip>
                </div>
              ))}

              {games.length === 0 && (
                <div className="text-center text-sm text-gray-400 px-6 py-6">No matches available at the moment.</div>
              )}
            </>
          )}

          {/* <!-- Repeat ends --> */}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PremierLeague;
