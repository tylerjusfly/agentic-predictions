"use client";

import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NavHeader = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-between px-6 py-1">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" width={70} height={70} alt="logo" />
        </Link>
      </div>

      <nav className={`flex flex-row z-[1] bg-white transition-all ease-in duration-500`} ref={navRef}>
        {isLoginPage ? (
          <Button className="primary-btn" asChild variant="default">
            <Link href="/pro" className="px-4 text-slate-200 font-bold bg-primary py-2 rounded-md">
              Signup
            </Link>
          </Button>
        ) : (
          <Button className="primary-btn" asChild variant="default">
            <Link href="/login" className="px-4 text-slate-200 font-bold bg-primary py-2 rounded-md">
              Login
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
};

export default NavHeader;
