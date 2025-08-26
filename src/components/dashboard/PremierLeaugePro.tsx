"use client"

import { TabletIcon, ChevronDownIcon, ChevronRightIcon, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import MatchCard from "./MatchCard";
import { IPrediction } from "@/api/predictions";
import { updatePremierLeaguesGames } from "@/app/actions";
import { useGetUser } from "@/hooks/useGetUser";

const PremierLeaugePro = ({ games, fetchGames }: { games: IPrediction[], fetchGames: () => Promise<void> }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useGetUser()

  
  const handleFetchResults = async() => {
    setLoading(true);
    const isCalled = await updatePremierLeaguesGames()
    if(isCalled){
      fetchGames()
      setLoading(false);
    }else{
      // Do nothing
    }
  }

  return (
    <div className="bg-[#0f111b] rounded-md">
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-4 border-b border-[#2a2550]">
        <div className="flex items-center">
          <TabletIcon color="white" className="mr-2" />
          <span className="text-sm font-medium text-nowrap text-white">Premier League</span>
        </div>

        {/* Collapse button */}
        <button onClick={() => setIsCollapsed((prev) => !prev)} className="text-white transition">
          {isCollapsed ? <ChevronRightIcon size={18} /> : <ChevronDownIcon size={18} />}
        </button>
      </div>

      {user?.roles.includes("ADMIN") && (
        <div className="px-2 py-2 border-b border-[#2a2550] flex justify-end">
          <button
            onClick={handleFetchResults}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#2a2550] rounded hover:bg-[#3a3570] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Fetching..." : "Fetch Results"}
          </button>
        </div>
      )}

      {/* Collapsible content */}
      {!isCollapsed && (
        <>
          {games.map((data) => (
            <MatchCard data={data} key={data.id} />
          ))}
          {games.length === 0 && (
            <div className="text-center text-sm text-gray-400 px-6 py-6">No matches available at the moment.</div>
          )}
        </>
      )}
    </div>
  );
};

export default PremierLeaugePro;
