'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Games', icon: <Users size={16} />, path: '/dashboard' },
  // { label: 'Pro', icon: <ShieldCheck size={16} />, path: '/dashboard/pro' },
  { label: 'Settings', icon: <Settings size={16} />, path: '/dashboard/settings' },
];

export default function TabControls() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex rounded-full bg-gray-100 p-1 shadow-inner">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;

          return (
            <Link key={tab.label} href={tab.path} passHref>
              <button
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow'
                    : 'text-gray-600 hover:text-[#f6661d]'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
