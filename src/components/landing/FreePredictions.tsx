"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import PredictionsCard from "./PredictionsCard";

export const FreePredictions = () => {
  const [tag, setTag] = useState("england");

  return (
    <div className="p-6 w-full max-w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Sports</h2>
      <p className="text-sm text-gray-700 mb-4">
        Choose between different sports like Football, Tennis, Basketball, Hockey, Volleyball, and Handball.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setTag("england")}
          className={cn(
            "px-5 py-2 rounded-full text-sm shadow-md font-medium",
            tag === "england" ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : "bg-white text-gray-800"
          )}
        >
          England
        </button>

        <button
          onClick={() => setTag("championsleague")}
          className={cn(
            "px-5 py-2 rounded-full text-sm shadow-md font-medium",
            tag === "championsleague" ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : "bg-white text-gray-800"
          )}
        >
          Champions League
        </button>
        {/* <button
          onClick={() => setTag("france")}
          className={cn(
            "px-5 py-2 rounded-full text-sm shadow-md font-medium",
            tag === "france" ? "bg-indigo-600 text-white" : "bg-white text-gray-800"
          )}
        >
          France
        </button> */}
      </div>

      <PredictionsCard country={tag} />
    </div>
  );
};
