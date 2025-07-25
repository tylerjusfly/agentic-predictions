"use client";

import React, { useRef } from "react";
import HeroSection from "../components/landing/HeroSection";
import NavHeader from "../components/landing/NavHeader";
import { animate } from "framer-motion";
import { FreePredictions } from "../components/landing/FreePredictions";
import Footer from "../components/landing/Footer";

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
        className="min-h-screen flex flex-col justify-start mt-5"
      >
        <FreePredictions/>
      </section>
      <Footer/>
    </>
  );
};

export default Main;
