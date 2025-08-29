import { cn } from "@/lib/utils";
import TabControls from "@/components/dashboard/tabControls";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className={cn("relative min-h-screen")}>
     
      <div className="m-4">
        <TabControls />
        {children}
      </div>
    </div>
  );
}
