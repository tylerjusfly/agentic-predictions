'use client';
import React from 'react';

const matchHistory = {
  Qarabag: ['D', 'W', 'W', 'W', 'W'],
  Shelbourne: ['W', 'L', 'D', 'D', 'W'],
};

const getBadgeColor = (result: string) => {
  switch (result) {
    case 'W':
      return 'bg-emerald-500 text-white';
    case 'D':
      return 'bg-yellow-500 text-black';
    case 'L':
      return 'bg-rose-500 text-white';
    default:
      return 'bg-gray-400';
  }
};

export default function ChampionsLeagueTipCard() {
  return (
    <div className="max-w-sm mx-auto rounded-xl bg-[#1c1f2e] text-white p-4 shadow-lg space-y-4 font-mono">
      <h2 className="text-center text-lg border-b border-gray-500 pb-2 font-semibold">
        Champions League Tips
      </h2>

      {/* Qarabag */}
      <div className="text-center space-y-2">
        <div className="text-xl font-bold">Qarabagh</div>
        <div className="flex justify-center gap-1">
          {matchHistory.Qarabag.map((r, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-1 rounded-md ${getBadgeColor(r)}`}
            >
              {r}
            </span>
          ))}
        </div>
        <div className="border border-cyan-400 text-cyan-300 px-4 py-1 rounded-md inline-block font-semibold">
          Home 3-0
        </div>
        <div>
          <button className="px-4 py-1 border border-gray-500 text-gray-400 rounded-md text-xs">
            MATCH PREVIEW
          </button>
        </div>
      </div>

      {/* Shelbourne */}
      <div className="text-center space-y-2">
        <div className="text-xl font-bold">Shelbourne</div>
        <div className="flex justify-center gap-1">
          {matchHistory.Shelbourne.map((r, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-1 rounded-md ${getBadgeColor(r)}`}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Odds */}
      <div className="flex justify-between text-center text-xs text-indigo-400 font-semibold pt-2">
        <div className="flex-1">
          <div className="text-white mb-1">1</div>
          <div>1.21</div>
        </div>
        <div className="flex-1">
          <div className="text-white mb-1">X</div>
          <div>6.70</div>
        </div>
        <div className="flex-1">
          <div className="text-white mb-1">2</div>
          <div>14.50</div>
        </div>
      </div>
    </div>
  );
}
