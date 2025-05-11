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
              <h1 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">Welcome to Keyla</h1>
              <p className="techP bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">Technology Marketplace</p>
              <p className="techP2 bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
                Discover and share amazing content with our community
              </p>

            {/*   <div className="btnExploreContainer">
                <button className="btnExplore" onClick={handleScroll}>
                  Explore
                </button>
              </div> */}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Intro;
