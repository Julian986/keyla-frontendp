import { RefObject } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./intro.css";
import "../../index.css"; 

type IntroProps = {
  mainRef: RefObject<HTMLDivElement | null>; // Recibir la referencia
};

const Intro = ({ mainRef }: IntroProps) => {
  
  const handleScroll = () => {
    console.log("funciona");
    if (mainRef.current) {
      const offset = 130; // Ajusta este valor según lo que necesites
      const targetPosition = mainRef.current.getBoundingClientRect().top + window.scrollY - offset;
  
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };
  

  return (
    <>
      {/* Sección principal */}
      <div className="home-section">
  <Container>
  <Row className="justify-content-center text-center">
    <Col md={8}>
      {/* Títulos con tamaños más moderados */}
      <h1 className="
        bg-clip-text text-transparent text-center 
        bg-gradient-to-b from-neutral-600 to-white 
        text-3xl md:text-3xl lg:text-5xl  // Ajuste de tamaños (antes era hasta 7xl)
        font-sans py-4 md:py-8 relative z-20 
        font-bold tracking-tight
      ">
        Welcome to Keyla
      </h1>

      <p className="
        bg-clip-text text-transparent text-center 
        bg-gradient-to-b from-neutral-600 to-white 
        text-2xl md:text-2xl lg:text-3xl  // Reduje los tamaños
        font-sans py-3 md:py-6 relative z-20 
        font-bold tracking-tight
      ">
        Technology Marketplace
      </p>

      <p className="
        bg-clip-text text-transparent text-center 
        bg-gradient-to-b from-neutral-600 to-white 
        text-xl md:text-1xl lg:text-2xl  // Texto más pequeño (para frases largas)
        font-sans py-2 md:py-4 relative z-20 
        font-bold tracking-tight
      ">
        Discover and share amazing content with our community
      </p>
    </Col>
  </Row>
</Container>
      </div>
    </>
  );
};

export default Intro;
