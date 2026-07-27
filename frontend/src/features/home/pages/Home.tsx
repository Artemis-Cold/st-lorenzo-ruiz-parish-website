import Navbar from "../../../components/layout/Navbar";
import About from "../components/About";
import Hero from "../components/Hero";
import Schedule from "../components/Schedule";
import Services from "../components/Services";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Schedule />
      <Services />
    </>
  );
}
