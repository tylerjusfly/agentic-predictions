import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PublicFixtureTableSkeleton = () => {
  return (
    <div className="flex items-center px-6 py-4 hover:bg-[#19143d] transition">
      {/* Time and Date */}
      <div className="w-32">
        <Skeleton className="h-4 w-16 mb-1 bg-[#2e2a4d]" />
        <Skeleton className="h-3 w-20 bg-[#2e2a4d]" />
      </div>

      {/* Teams */}
      <div className="flex-1 flex items-center gap-2">
        <Skeleton className="h-4 w-20 bg-[#2e2a4d]" />
        <Skeleton className="h-4 w-6 bg-[#2e2a4d]" />
        <Skeleton className="h-4 w-20 bg-[#2e2a4d]" />
      </div>

      {/* Confidence Level */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-12 rounded-md bg-[#2e2a4d]" />
      </div>
     
          <div className="ml-4 text-white opacity-40 cursor-pointer">🔒</div>
       
    </div>
  );
};

export default PublicFixtureTableSkeleton;