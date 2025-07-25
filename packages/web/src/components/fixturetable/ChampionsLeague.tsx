"use client";

import { getChampionsLeagues, IPrediction } from "@/src/api/predictions";
import React, { useEffect, useState } from "react";
import { GamesTable } from "../ui/gamesTable";
import { ChampionsLeagueIcon } from "@/src/icons/ChampionsLeague";


const ChampionsLeague = () => {
  const [games, setGames] = useState<IPrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchGames() {
    try {
      const response = await getChampionsLeagues();

      if (response.games) {
        setGames(response.games || []);
      }
    } catch (e: any) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, []);

  const props = {
    title: "Champions Leauge",
    games,
    loading,
    TableIcon: ChampionsLeagueIcon
  }

  return (
   <GamesTable {...props}  />
  );
};

export default ChampionsLeague;
