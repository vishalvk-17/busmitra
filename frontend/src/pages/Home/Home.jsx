import "./Home.css";

import useSearchForm from "../../hooks/useSearchForm";

import Navbar from "../../components/layout/Navbar/Navbar";
import Hero from "../../components/home/Hero/Hero";
import Features from "../../components/home/Features/Features";
import PopularRoutes from "../../components/home/PopularRoutes/PopularRoutes";
import HowItWorks from "../../components/home/HowItWorks/HowItWorks";
import DownloadApp from "../../components/home/DownloadApp/DownloadApp";
import Testimonials from "../../components/home/Testimonials/Testimonials";
import FAQ from "../../components/home/FAQ/FAQ";
import Footer from "../../components/layout/Footer/Footer";

function Home() {
  const {
    form,
    error,
    handleChange,
    handleSubmit,
  } = useSearchForm();

  return (
    <>
      <Navbar />

      <main className="home">
        <Hero
          form={form}
          error={error}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />

        <Features />

        <PopularRoutes />

        <HowItWorks />

        <DownloadApp />

        {/* <Testimonials /> */}

        <FAQ />
      </main>

      <Footer />
    </>
  );
}

export default Home;