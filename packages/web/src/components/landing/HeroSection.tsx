"use client";

import { memo, useRef } from "react";
import { animate, motion } from "framer-motion";
import { fadeInLeft, fadeInRight } from "@/src/lib/framer-motion-fns";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import { Button } from "@/src/components/ui/button";
// import {SigmaIcon} from 'lucide-react'
import { siGoogle } from "simple-icons";

function GoogleIcon() {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={`#${siGoogle.hex}`}
      width={24}
      height={24}
      className="mr-2"
    >
      <title>{siGoogle.title}</title>
      <path d={siGoogle.path} />
    </svg>
  );
}

const StaticHeroSection = ({handleScroll}: {handleScroll: () => void}) => {
  const isMobile = useIsMobile();

  const fadeInLeftAnimation = !isMobile ? fadeInLeft : {};
  const fadeInRightAnimation = !isMobile ? fadeInRight : {};


  return (
    <div className="mx-6 md:mx-auto flex flex-wrap items-center justify-center mt-10 md:px-12 md:flex-row">

      {/* <div className="flex flex-col lg:flex-row items-center justify-between bg-[url('/logo.png')] bg-no-repeat bg-center bg-cover lg:bg-none py-10 px-6"></div> */}
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
              <GoogleIcon />
              sign up with GOOGLE
            </Button>
          </div>
        </motion.h2>
      </div>
      <div className="hidden lg:block lg:w-1/2">
        <img className="mx-auto" width={400} height={600} src="/logo.png" alt="" />
      </div>
    </div>
  );
};

export default memo(StaticHeroSection);
