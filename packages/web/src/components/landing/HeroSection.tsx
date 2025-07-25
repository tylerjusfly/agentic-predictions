"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { fadeInLeft, fadeInRight } from "@/src/lib/framer-motion-fns";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import { Button } from "@/src/components/ui/button";

function VolleyBallIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volleyball-icon lucide-volleyball"><path d="M11.1 7.1a16.55 16.55 0 0 1 10.9 4"/><path d="M12 12a12.6 12.6 0 0 1-8.7 5"/><path d="M16.8 13.6a16.55 16.55 0 0 1-9 7.5"/><path d="M20.7 17a12.8 12.8 0 0 0-8.7-5 13.3 13.3 0 0 1 0-10"/><path d="M6.3 3.8a16.55 16.55 0 0 0 1.9 11.5"/><circle cx="12" cy="12" r="10"/></svg>
  );
}

const StaticHeroSection = ({handleScroll}: {handleScroll: () => void}) => {
  const isMobile = useIsMobile();

  const fadeInLeftAnimation = !isMobile ? fadeInLeft : {};
  const fadeInRightAnimation = !isMobile ? fadeInRight : {};


  return (
    <div className="mx-6 md:mx-auto flex flex-wrap items-center justify-center mt-10 md:px-12 md:flex-row">

      <div className="w-full lg:hidden my-2 flex justify-center">
    <img
      className="max-w-[160px] w-full h-auto md:max-w-[180px] lg:hidden"
      src="/logo.png"
      alt="Agentic Predictions Logo"
    />
  </div>

      <div className="mb-14 lg:mb-0 lg:w-1/2">
        <motion.h1
          className="max-w-xl text-primary text-4xl font-semibold text-dark -tracking-[.5px] md:text-center lg:text-left lg:leading-tight mb-5"
          {...{ ...fadeInRightAnimation, transition: { delay: 0.2, duration: 0.6 } }}
        >
          Agentic Predictions.
        </motion.h1>
        <motion.h2
          className=" max-w-xl text-gray-500 font-semibold text-dark -tracking-[.5px] md:text-center lg:text-left lg:max-w-md"
          {...{ ...fadeInLeftAnimation, transition: { delay: 0.2, duration: 0.6 } }}
        >
          Predict the Game. Beat the Odds. Win Big. Unlock powerful, AI-driven predictions for your favorite sports and get the
          edge you deserve. Whether you’re a casual fan or a serious bettor, our advanced models analyze data to help you make
          smarter picks — fast, accurate, and tailored to you.
          <div className="flex items-center mt-8 lg:justify-start">
            <Button  onClick={handleScroll} size="lg" variant="outline">
              <VolleyBallIcon />
              View Predictions
            </Button>
          </div>
        </motion.h2>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <img className="mx-auto" width={400} height={600} src="/logo.png" alt="" />
      </div>

       {/* Background decorative elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div> */}
      
    </div>
  );
};

export default memo(StaticHeroSection);
