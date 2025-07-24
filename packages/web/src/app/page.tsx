"use client";

import React, { useRef } from "react";
// import nextConfig from "@/next.config";
import HeroSection from "../components/landing/HeroSection";
import NavHeader from "../components/landing/NavHeader";
import { animate } from "framer-motion";
import SignUpForm from "../components/landing/SignupForm";
import { FreePredictions } from "../components/landing/FreePredictions";

const Main = () => {
  const signupRef = useRef(null);

  const handleScroll = () => {
    const targetOffset = signupRef.current.offsetTop;

    animate(window.scrollY, targetOffset, {
      duration: 1.5,
      ease: "easeInOut",
      onUpdate: (latest) => {
        window.scrollTo(0, latest);
      }
    });
  };

  return (
    <>
      <NavHeader />

      <HeroSection handleScroll={handleScroll} />

      <section
        ref={signupRef}
        className="h-screen flex justify-center items-start mt-5 lg:mt-20"
      >
        {/* <SignUpForm/> */}
        <FreePredictions/>
      </section>
    </>
  );
};

export default Main;
