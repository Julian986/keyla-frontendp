import { useNavigate, useLocation } from "react-router-dom";
import { TbSquareRoundedArrowLeftFilled } from "react-icons/tb";
import { useEffect } from "react";

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Rutas donde no mostrar el botón
  const hideOnRoutes = ["/", "/home", "/chats", "/tables", "/support", "/contact%20us", "/profile", "/plans", "/Plans"];
  
  // Rutas especiales que requieren manejo diferente
  const specialBackRoutes = ["/contact-seller", "/chat/"];

  const shouldHide = hideOnRoutes.some(route => 
    location.pathname.toLowerCase() === route.toLowerCase()
  );

  const isSpecialRoute = specialBackRoutes.some(route => 
    location.pathname.toLowerCase().startsWith(route.toLowerCase())
  );

  // Verifica si está en la ruta PaymentForm
  const isPaymentForm = location.pathname.toLowerCase() === "/paymentform";

    useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }, []);

  const handleBackClick = () => {
    if (isSpecialRoute) {
      navigate('/chats');
    } else {
      navigate(-1);
    }
  };

  if (shouldHide) return null;

  return (
    <button
      onClick={handleBackClick}
      style={{
        position: "absolute",
        top: isPaymentForm ? "150px" : "42px", // Condición para PaymentForm
        left: "18px",
        fontSize: "42px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        zIndex: 9000
      }}
    >
      <TbSquareRoundedArrowLeftFilled style={{ color: "white" }} />
    </button>
  );
};

export default BackButton;