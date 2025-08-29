"use client";

import { getPremierLeaguesPro, IPrediction } from "@/api/predictions";
import PremierLeaugePro from "@/components/dashboard/PremierLeaugePro";
import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState } from "react";

type Iresponse = {
  games: IPrediction[];
};

const PremierLeaugePage = () => {
  const [premierData, setPremierData] = useState<Iresponse>({ games: [] });
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await getPremierLeaguesPro();
      setPremierData(data);
    } catch (error: any) {
      console.error(error?.message || "failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <main className="space-y-5">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <LoaderPinwheel className="w-10 h-10 animate-spin text-[#f6661d]" />
        </div>
      )}
      <PremierLeaugePro games={premierData.games} fetchGames={fetchGames} />
    </main>
  );
};

export default PremierLeaugePage;
