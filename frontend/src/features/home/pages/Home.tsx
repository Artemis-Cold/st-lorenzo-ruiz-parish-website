import Navbar from "../../../components/layout/Navbar";
import About from "../components/About";
import Hero from "../components/Hero";
import Schedule from "../components/Schedule";
import Services from "../components/Services";
import Announcements from "../components/Announcements";
import ScrollToTopButton from "../components/ScrollToTopButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Announcements />
      <Schedule />
      <Services />
      <ScrollToTopButton />
    </>
  );
}
