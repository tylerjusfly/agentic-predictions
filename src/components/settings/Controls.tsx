import { updatePremierLeaguesGames } from "@/api/cron";
import { useGetUser } from "@/hooks/useGetUser";
import { RefreshCw } from "lucide-react";
import React, { useState } from "react";

const Controls = () => {
  const [loading, setLoading] = useState(false);
  const user = useGetUser();

  const handleFetchResults = async () => {
    try {
      setLoading(true);
      const isCalled = await updatePremierLeaguesGames();

      if (isCalled.success) {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {user?.roles.includes("ADMIN") && (
        <div className="space-y-2">
          <h3 className="font-medium">Fetch Premier League</h3>
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
      <div className="space-y-2">
        <h3 className="font-medium">Terms of Service</h3>
        <p className="text-sm text-gray-600">Read our terms and conditions</p>
      </div>
    </div>
  );
};

export default Controls;
