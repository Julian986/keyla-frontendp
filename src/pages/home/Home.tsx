import { useState, useEffect, useRef } from "react";
import Header from "@/components/header/Header";
import Footer from "../../components/Footer/Footer"
import FilterSidebar from "../../components/Sidebar/FilterSidebar"
import "./Home.css";
import Main from "../../components/main/Main";
import ProdContainer from "../../components/prodContainer/ProdContainer";
import Intro from "../../components/intro/Intro";
import { BackgroundLines } from "../../components/aceternity/background-lines";
import { InfiniteSlider } from "@/components/sliderInfinite/InfiniteImageSlider";
import teclado from "../../../public/teclado3.png";
import { ShoppingCart } from "lucide-react";
import KeylaShoppingCart from "@/components/shoppingCart/ShoppingCart";
import { useSearch } from "@/context/SearchContext";

//slider
import corsair from "../../../public/corsair2.png";
import razer from "../../../public/Razer-Emblem2.png";
import th from "../../../public/th.png";
import logitech from "../../../public/logitech2.png";
import hyper from "../../../public/Hyper.png";
import sony from "../../../public/sony2.png";
import aorus from "../../../public/aorus2.png";

import { FiltersProvider } from "@/context/FilterContext";

import { World } from "@/components/aceternity/globe";
import { globeConfig } from "@/components/config/globe-config";
import { sampleData } from "@/data/globe-data";

import { MdKeyboardDoubleArrowDown } from "react-icons/md";

export const Home = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const { searchTerm } = useSearch();
  const scrollExecuted = useRef(false); // Para controlar ejecución única

  // Efecto principal para controlar el scroll
  useEffect(() => {
    if (scrollExecuted.current) return;
    
    const hasVisited = sessionStorage.getItem('hasVisitedKeyla');
    const scrollToMain = () => {
      if (mainRef.current) {
        const offset = 87;
        const targetPosition = mainRef.current.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    };

    if (!hasVisited) {
      // Primera visita
      sessionStorage.setItem('hasVisitedKeyla', 'true');
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      // Visitas posteriores
      scrollToMain();
    }

    scrollExecuted.current = true;
  }, []);

  // Scroll cuando hay searchTerm (prioridad máxima)
  useEffect(() => {
    if (searchTerm && mainRef.current) {
      const offset = 100;
      const top = mainRef.current.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [searchTerm]);

  const handleScroll = () => {
    if (mainRef.current) {
      const offset = 87;
      const targetPosition = mainRef.current.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  };

  return (
    <FiltersProvider>
      <Header />
      <div className="myContainer">
        <div className="introContainer">
          <Intro mainRef={mainRef} />
          <div className="globe-wrapper">
            <div className="globe-loading-message">Loading Earth...</div>
            <World globeConfig={globeConfig} data={sampleData} />
          </div>
          <MdKeyboardDoubleArrowDown className="downArrowsita" onClick={handleScroll} />
        </div>

          <BackgroundLines className="backgroundLines">
            <div></div>
          </BackgroundLines>
        <Main ref={mainRef}>
          <FilterSidebar />
          <ProdContainer searchTerm={searchTerm} />
        </Main>
      </div>

      <div className="py-12">
        <InfiniteSlider
          items={[
            { imageUrl: logitech, altText: "Imagen 1" },
            { imageUrl: th, altText: "Imagen 2" },
            { imageUrl: razer, altText: "Imagen 3" },
            { imageUrl: corsair, altText: "Imagen 3" },
            { imageUrl: hyper, altText: "Imagen 3" },
            { imageUrl: sony, altText: "Imagen 3" },
            { imageUrl: aorus, altText: "Imagen 3" },
          ]}
          direction="left"
          speed="normal"
          pauseOnHover
          className="[--gap:1rem] imgSlider"
        />
      </div>
      <Footer />
    </FiltersProvider>
  );
};