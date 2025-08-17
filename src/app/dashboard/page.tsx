import { getPremierLeaguesPro, IPrediction } from '@/api/predictions';
import PremierLeaugePro from '@/components/dashboard/PremierLeaugePro';
import React from 'react'

type Iresponse = {
  games: IPrediction[];
};


const DashboardPage = async() => {
  let premierData: Iresponse = { games: [] };

  try {
    premierData = await getPremierLeaguesPro();
  } catch (error) {
    console.error("Failed to fetch Premier League data:", error);
  }

  return (
    <main className="space-y-5">
    <PremierLeaugePro games={premierData.games} />
  </main>
  )
}

export default DashboardPage