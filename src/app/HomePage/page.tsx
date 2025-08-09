"use client";

import Hero from "@/components/Home/Hero";
import AI from "@/components/Home/Ai";
import InteriorScanning from "@/components/Home/InteriorScanning";
import Market from "@/components/Home/Market";
import Komunitas from "@/components/Home/Komunitas";
import Footer from "@/components/Home/Footer";
const Home = () => {
  return (
    <div className="bg-[#F6F6EC] ">
      <Hero/>
      <AI/>
      <InteriorScanning/>
      <Market/>
      <Komunitas/>
      <Footer/>
    </div>
  );
};

export default Home;
