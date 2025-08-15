"use client";

import { getPremierLeagues, IPrediction } from "@/api/predictions";
import React, { useEffect, useState } from "react";
import { siPremierleague } from "simple-icons";
import { GamesTable } from "./gamesTable";


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

 const props = {
    title: "England Premier League",
    games,
    loading,
    TableIcon: PremierLeagueIcon
  }

  return (
   <GamesTable {...props}  />
  
  );
};

export default PremierLeague;
