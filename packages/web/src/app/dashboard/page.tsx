import PremierLeaugePro from "@/src/components/dashboard/landing/PremierLeaugePro";
import ChampionsLeaguePro from "@/src/components/dashboard/landing/ChampionsLeaguePro";
import { getChampionsLeaguesPro, getPremierLeaguesPro } from "@/src/api/predictions";

const Dashboard = async () => {
  let premierData = { games: [] };
  let championsData = { games: [] };

  try {
    premierData = await getPremierLeaguesPro();
  } catch (error) {
    console.error("Failed to fetch Premier League data:", error);
  }

  try {
    championsData = await getChampionsLeaguesPro();
  } catch (error) {
    console.error("Failed to fetch Champions League data:", error);
  }

  return (
    <main className="space-y-5">
      <PremierLeaugePro games={premierData.games} />
      <ChampionsLeaguePro games={championsData.games} />
    </main>
  );
};

export default Dashboard;
//  http://localhost:3000/v1/results/fetchpremierleague