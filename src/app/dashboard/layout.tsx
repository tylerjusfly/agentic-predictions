import { cn } from "@/lib/utils";
import TabControls from "@/components/dashboard/tabControls";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className={cn("relative min-h-screen")}>
      {/* {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <LoaderPinwheel className="w-10 h-10 animate-spin text-[#f6661d]" />
        </div>
      )} */}

      <div className="m-4">
        <TabControls />
        {children}
      </div>
    </div>
  );
}
