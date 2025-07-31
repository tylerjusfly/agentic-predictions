import { TabletIcon } from "lucide-react";
import React from "react";
import MatchCard from "./MatchCard";
import { IPrediction } from "@/src/api/predictions";

const ChampionsLeaguePro = ({ games }: { games: IPrediction[] }) => {
  return (
    <div className="bg-[#0f111b] rounded-md">
      <div className="flex justify-between items-center px-2 py-4 border-b border-[#2a2550]">
        <div className="flex items-center">
          <TabletIcon color="white" className="mr-2" />
          <span className="text-sm font-medium text-nowrap text-white">Champions Leauge</span>
        </div>
      </div>

      <>
        {games.map((data) => (
          <MatchCard data={data} key={data.id} />
        ))}
        {games.length === 0 && (
          <div className="text-center text-sm text-gray-400 px-6 py-6">No matches available at the moment.</div>
        )}
      </>
    </div>
  );
};

export default ChampionsLeaguePro;
