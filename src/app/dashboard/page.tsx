"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremierLeagueIcon } from "@/icons/PremierLeague";
import Link from "next/link";

const leagues = [
  {
    name: "Premier League",
    description: "Top tier of English football.",
    icon: <PremierLeagueIcon color="#9810fa" width={24} height={24} />,
    teams: 20,
    link: "dashboard/leagues/premier-league",
  },
  // {
  //   name: "League One",
  //   description: "Third tier of English football.",
  //   icon: <Star className="text-blue-600" size={24} />,
  //   teams: 24,
  //   link: "/leagues/league-one",
  // },
  // {
  //   name: "Champions League",
  //   description: "Europe’s most prestigious tournament.",
  //   icon: <Trophy className="text-yellow-600" size={24} />,
  //   teams: 32,
  // },
];

const DashboardPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-6 sm:p-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Leagues ⚽ Dashboard
          </h1>
          <p className="text-gray-600">
            Explore major football leagues and competitions
          </p>
        </header>

        {/* League Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <Link key={league.name} href={league.link} className="block">
            <Card
              className="rounded-2xl shadow-md hover:shadow-lg transition bg-white"
            >
              <CardHeader className="flex flex-row items-center gap-3">
                {league.icon}
                <CardTitle className="text-lg font-semibold hover:underline">
                  {league.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  {league.description}
                </p>
                <p className="text-sm font-medium text-gray-800">
                  Teams: {league.teams}
                </p>
              </CardContent>
            </Card>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;


// {/* <div className="space-y-4">
//             <Card className="rounded-2xl shadow-md bg-white">
//               <CardHeader className="flex flex-row items-center justify-between">
//                 <CardTitle>Upcoming Fixtures</CardTitle>
//                 <CalendarDays size={18} className="text-gray-500" />
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {fixtures.map((fx) => (
//                   <div
//                     key={fx.match}
//                     className="p-3 rounded-lg border hover:bg-red-50 transition"
//                   >
//                     <p className="text-sm font-medium text-gray-900">{fx.match}</p>
//                     <p className="text-xs text-gray-500">{fx.date} • {fx.time}</p>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Quick Link */}
//             <Card className="rounded-2xl shadow bg-white p-4 text-center">
//               <Link
//                 href="/dashboard/all-fixtures"
//                 className="text-sm font-medium text-red-600 hover:underline"
//               >
//                 View all fixtures →
//               </Link>
//             </Card>
//           </div> */}