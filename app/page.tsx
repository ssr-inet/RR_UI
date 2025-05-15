"use client";

import React, { useEffect } from "react";
import "aos/dist/aos.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PartnersMarquee } from "@/components/PartnersMarquee";
import { HeroSection } from "@/components/HeroSection";
import { DynamicHero } from "@/components/DynamicHero";
import { MarqueeTestimonials } from "@/components/MarqueeTestimonials";
import Aos from "aos";

export default function page() {
  useEffect(() => {
    Aos.init({
      duration: 800,
      once: false,
    });
  }, []);
  return (
    <div className="flex flex-col container gap-[40px] overflow-x-auto items-center justify-start mx-auto">
      <Navbar></Navbar>
      <DynamicHero></DynamicHero>
      {/* <HeroSection></HeroSection> */}
      <MarqueeTestimonials className=""></MarqueeTestimonials>
      <PartnersMarquee></PartnersMarquee>
      <Footer></Footer>
    </div>
  );
}
