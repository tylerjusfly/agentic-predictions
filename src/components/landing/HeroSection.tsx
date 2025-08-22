
"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { fadeInLeft, fadeInRight } from "@/lib/framer-motion-fns";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const StaticHeroSection = () => {
  const isMobile = useIsMobile();

  const OnsubScribe = () => {
    // Your subscribe logic here
  };

  return (
    <div className="mx-6 md:mx-auto flex flex-wrap items-center justify-center mt-10 md:px-12 md:flex-row">
      {/* Mobile Logo */}
      <div className="w-full lg:hidden my-2 flex justify-center">
        <Image
          width={100}
          height={100}
          className="max-w-[160px] w-full h-auto md:max-w-[180px] lg:hidden"
          src="/logo.png"
          alt="Agentic Predictions Logo"
        />
      </div>

      {/* Left Text Column */}
      <div className="mb-14 lg:mb-0 lg:w-1/2">
        {!isMobile ? (
          <>
            <motion.h1
              className="max-w-xl text-primary text-4xl font-semibold text-dark -tracking-[.5px] md:text-center lg:text-left lg:leading-tight mb-5"
              {...{ ...fadeInRight, transition: { delay: 0.2, duration: 0.6 } }}
            >
              Agentic Predictions.
            </motion.h1>

            <motion.p
              className="max-w-xl text-gray-500 font-semibold text-dark -tracking-[.5px] md:text-center lg:text-left lg:max-w-md"
              {...{ ...fadeInLeft, transition: { delay: 0.2, duration: 0.6 } }}
            >
              Predict the Game. Beat the Odds. Win Big. Unlock powerful, AI-driven predictions for your favorite sports and get
              the edge you deserve. Whether you’re a casual fan or a serious bettor, our advanced models analyze data to help
              you make smarter picks — fast, accurate, and tailored to you.
            </motion.p>
          </>
        ) : (
          <>
            <h1 className="max-w-xl text-primary text-4xl font-semibold text-dark -tracking-[.5px] md:text-center lg:text-left lg:leading-tight mb-5">
              Agentic Predictions.
            </h1>
            <p className="max-w-xl text-gray-500 font-semibold text-dark -tracking-[.5px] md:text-center lg:text-left lg:max-w-md">
              Predict the Game. Beat the Odds. Win Big. Unlock powerful, AI-driven predictions for your favorite sports and get
              the edge you deserve. Whether you’re a casual fan or a serious bettor, our advanced models analyze data to help
              you make smarter picks — fast, accurate, and tailored to you.
            </p>
          </>
        )}

        {/* Button (common for both) */}
        <div className="flex items-center mt-8 lg:justify-start md:justify-center">
            <Link href='/pro'>
          <Button className="cursor-pointer" onClick={OnsubScribe} size="lg" variant="outline">
            <ShieldCheck className="mr-2" />
            Subscribe to PRO
          </Button>
            </Link>
        </div>
      </div>

      {/* Right Image */}
      <div className="hidden lg:block lg:w-1/2">
        <Image className="mx-auto" width={400} height={600} src="/logo.png" alt="" />
      </div>
    </div>
  );
};

export default memo(StaticHeroSection);
