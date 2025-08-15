import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PublicFixtureTableSkeleton from "@/skeletons/PublicFixtureTableSkeleton";
import { IPrediction } from "@/api/predictions";

interface GamesTableProps {
  games: IPrediction[];
  loading?: boolean;
  TableIcon(): React.JSX.Element;
  title: string;
}

const GamesTable: React.FC<GamesTableProps> = ({ games, loading = true, TableIcon, title }) => {
  return (
    <TooltipProvider>
      <div className="bg-[#0e0b2b] text-white rounded-xl overflow-hidden max-w-full shadow-lg">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a2550]">
          <div className="flex items-center">
            <TableIcon />
            <span className="text-sm font-medium text-nowrap text-white">{title}</span>
          </div>
          {/* <button className="text-white text-sm opacity-80">AI Confidence Level</button> */}
        </div>

        <div className="divide-y divide-[#2a2550]">
          {loading ? (
            <>
              <PublicFixtureTableSkeleton />
              <PublicFixtureTableSkeleton />
              <PublicFixtureTableSkeleton />
              <PublicFixtureTableSkeleton />
              <PublicFixtureTableSkeleton />
            </>
          ) : (
            <>
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-[#19143d] transition"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                    <div className="text-sm text-gray-300 w-full sm:w-32">
                      {game.time}
                      <div className="text-xs text-[#87a1d1]">{game.date}</div>
                    </div>

                    <div className="flex items-center gap-2 ml-0 sm:ml-16">
                      <span className="font-semibold text-white">{game.home_team}</span>
                      <span className="text-[#7b6cbf] font-bold">VS</span>
                      <span className="font-semibold text-white">{game.away_team}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 sm:mt-0 self-end sm:self-auto">
                    <div className="bg-[#1f1a42] text-sm px-3 py-1 rounded-md text-white">{game.confidence_level}</div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-4 text-white opacity-40 cursor-pointer">🔒</div>
                      </TooltipTrigger>
                      <TooltipContent side="top">Subscribe to PRO to access predictions</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}

              {games.length === 0 && (
                <div className="text-center text-sm text-gray-400 px-6 py-6">No matches available at the moment.</div>
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export { GamesTable };
