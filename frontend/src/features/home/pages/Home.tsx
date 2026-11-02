import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SLRPAR from "../components/SLRPAR";
import Navbar from "../../../components/layout/Navbar";
import About from "../components/About";
import Hero from "../components/Hero";
import Schedule from "../components/Schedule";
import Services from "../components/Services";
import Announcements from "../components/Announcements";
import ScrollToTopButton from "../components/ScrollToTopButton";
import MarriageBanns from "../components/MarriageBanns";

export default function Home() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== "#slrp-ar") return;
    const frame = requestAnimationFrame(() =>
      document.getElementById("slrp-ar")?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <>
      <Navbar />
      <Hero />
      <Announcements />
      <MarriageBanns />
      <Schedule />
      <Services />
      <SLRPAR />
      <About />
      <ScrollToTopButton />
    </>
  );
}
