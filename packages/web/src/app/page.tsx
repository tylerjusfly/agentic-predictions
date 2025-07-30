"use client";

import React, { useRef } from "react";
import HeroSection from "../components/landing/HeroSection";
import NavHeader from "../components/landing/NavHeader";
import { animate } from "framer-motion";
import { FreePredictions } from "../components/landing/FreePredictions";
import Footer from "../components/landing/Footer";

const Main = () => {
  return (
    <>
      <NavHeader />

      <HeroSection />

      <FreePredictions />

      <Footer />
    </>
  );
};

export default Main;
