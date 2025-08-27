import { IPrediction } from "@/api/predictions";
import { cn, getWinnerOrDraw } from "@/lib/utils";
import React from "react";

type matchCardProps = {
  data: IPrediction;
};

const MatchCard = ({ data }: matchCardProps) => {
  const predictedWinner =
    data.away_team === data.predicted_winner ? "Away" : data.home_team === data.predicted_winner ? "Home" : "Draw";

  const actualOutcome = getWinnerOrDraw(data.actual_score || "0-0");

  return (
    <div className="flex flex-col gap-3 px-6 py-4 hover:bg-[#19143d] rounded-md transition border-b border-[#2a2550]">
      {/* Time and Teams */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
          <div className="text-sm text-gray-300 w-full sm:w-32">
            {data.time}
            <div className="text-xs text-[#87a1d1]">{data.date}</div>
          </div>

          <div className="flex items-center gap-2 ml-0 sm:ml-16">
            <span className="font-semibold text-white">{data.home_team}</span>
            <span className="text-[#7b6cbf] font-bold">VS</span>
            <span className="font-semibold text-white">{data.away_team}</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex flex-col sm:items-end gap-1 mt-3 sm:mt-0 self-end sm:self-auto text-sm text-white">
          {/* Confidence Level */}
          <div className="bg-[#1f1a42] px-3 py-1 rounded-md w-fit">
            Confidence: <span className="text-cyan-300 font-semibold">{data.confidence_level}</span>
          </div>
        </div>
      </div>

      {/* Prediction Result */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Prediction */}
        <div className="border border-cyan-400 text-cyan-300 px-4 py-1 rounded-md font-semibold w-fit">
          {predictedWinner} {data.predicted_score}
        </div>

        {/* WIN */}
        <div
          className={`border px-4 py-1 rounded-md font-semibold text-sm w-fit
    ${
      data.actual_score
        ? predictedWinner === actualOutcome
          ? "border-green-400 bg-green-900 text-green-200"
          : "border-red-400 bg-red-900 text-red-200"
        : "border-indigo-400 text-indigo-300"
    }`}
        >
           {predictedWinner} {predictedWinner !== "Draw" && "Win"}
        </div>

        {/* FT Result */}
        <div
          className={`border px-4 py-1 rounded-md font-semibold text-sm w-fit
    ${
      data.actual_score
        ? data.actual_score === data.predicted_score
          ? "border-green-400 bg-green-900 text-green-200"
          : "border-red-400 bg-red-900 text-red-200"
        : "border-indigo-400 text-indigo-300"
    }`}
        >
          FT: {data.actual_score ? data.actual_score : "TBD"}
        </div>

      
      </div>
      

      {/* getWinnerOrDraw */}
      {/* Odds Section */}
      <div className="flex justify-between text-xs text-indigo-400 font-semibold pt-1">
        <div
          className={cn(
            "flex-1 text-center font-bold",
            data.actual_score === null
              ? "text-white" // game not yet played
              : predictedWinner === "Home"
              ? actualOutcome === "Home"
                ? "text-green-500" // predicted correctly
                : "text-red-500" // predicted wrong
              : "text-white" // not predicted home
          )}
        >
          <div className="mb-1">1</div>
          <div>{data.home_win_probability}</div>
        </div>

       <div
          className={cn(
            "flex-1 text-center font-bold",
            data.actual_score === null
              ? "text-white" // game not yet played
              : predictedWinner === "Draw"
              ? actualOutcome === "Draw"
                ? "text-green-500"
                : "text-red-500"
              : "text-white"
          )}
        >
          <div className=" mb-1">X</div>
          <div>0.0</div>
        </div>
        <div
          className={cn(
            "flex-1 text-center font-bold",
            data.actual_score === null
              ? "text-white" // game not yet played
              : predictedWinner === "Away"
              ? actualOutcome === "Away"
                ? "text-green-500"
                : "text-red-500"
              : "text-white"
          )}
        >
          <div className="mb-1">2</div>
          <div>{data.away_win_probability}</div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;