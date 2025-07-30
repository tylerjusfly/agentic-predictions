import PremierLeaugePro from "@/src/components/dashboard/landing/PremierLeaugePro";
import ChampionsLeaguePro from "@/src/components/dashboard/landing/ChampionsLeaguePro";
import { getChampionsLeaguesPro, getPremierLeaguesPro } from "@/src/api/predictions";


const Dashboard = async () => {
  const premierData = await getPremierLeaguesPro();
  const championsData = await getChampionsLeaguesPro();

  return (
    <main className="space-y-5">
      <PremierLeaugePro games={premierData.games} />
      <ChampionsLeaguePro games={championsData.games} />
    </main>
  );
};

export default Dashboard;

