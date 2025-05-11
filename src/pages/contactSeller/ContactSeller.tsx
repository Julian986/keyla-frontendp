import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { FiMessageCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import "./contactSeller.css"

import { useToast } from "@/context/ToastContext";

const ContactSeller = () => {
  const { state } = useLocation();
  const { productId, sellerId, productName, sellerName, productImage } = state;
  const [message, setMessage] = useState("Is the product still available?");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
   const { showToast } = useToast();

  const [sellerPhone, setSellerPhone] = useState<string | null>(null); // Nuevo estado para el teléfono


  // Verificar si el chat existe al cargar
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const res = await axios.get(`/user/${sellerId}`);
        setSellerPhone(res.data.phone || null);
      } catch (error) {
        console.error("Error fetching seller data:", error);
      }
    };

    const checkChat = async () => {
      try {
        const res = await axios.get(`/chat/check?productId=${productId}&sellerId=${sellerId}`, {
          headers: { Authorization: `Bearer ${auth?.token}` }
        });
        if (res.data.exists) {
          setChatId(res.data.chatId);
        }
      } catch (error) {
        console.error("Error verificando chat:", error);
      }
    };
    fetchSellerData();
    checkChat();
  }, [productId, sellerId, auth?.token]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("/chat/init", {
        productId,
        sellerId,
        initialMessage: message
      }, {
        headers: { 
          Authorization: `Bearer ${auth?.token}`,
          "Content-Type": "application/json"
        }
      });
      navigate(`/chat/${res.data.chat._id}`);
    } catch (error) {
      console.error("Error al iniciar chat:", error);
      alert("Error al enviar mensaje");
    } finally {
      setIsLoading(false);
    }
  };

/*   const handleWhatsAppClick = () => {
    // Lógica para redirigir a WhatsApp
    const phoneNumber = ""; // Aquí deberías obtener el número del vendedor
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }; */

    const handleWhatsAppClick = () => {
    if (!sellerPhone || sellerPhone.trim() === "") {
      showToast("This seller hasn't provided a WhatsApp number");
      return;
    }

    // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
    const cleanedPhone = sellerPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  useEffect(() => {
  if (!productId || !sellerId) {
    console.error("Faltan productId o sellerId en el estado de navegación");
    // Redirige o muestra un mensaje de error
  }
}, [productId, sellerId]);

  return (
    <div className="contact-container">
      <h2>Contact {sellerName}</h2>
      <h5 className="productNameMargin">Product: {productName}</h5>

      <div className="contact-options">
        <div className="message-option">
          {chatId ? (
            <button
              onClick={() =>
                navigate(`/chat/${chatId}`, {
                  state: { productId, sellerId, productName, sellerName, productImage }
                })
              }
              className="send-message-btn messageBtn"
            >
              <span className="message-icon-container">
                <FiMessageCircle className="message-icon" />
              </span>
              Ir al chat
            </button>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí"
              />
              <button 
                onClick={handleSendMessage} 
                className="send-message-btn messageBtn"
                disabled={isLoading}
              >
                <span className="message-icon-container">
                  <FiMessageCircle className="message-icon" />
                </span>
                {isLoading ? "Sending..." : "Send message"}
              </button>
            </>
          )}
        </div>

        <div className="whatsapp-option">
          <p>Or chat on WhatsApp</p>
          <button onClick={handleWhatsAppClick} className="whatsapp-btn compact">
            <span className="whatsapp-icon-container">
              <FaWhatsapp className="whatsapp-icon" />
            </span>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSeller;
  

/*   return (
    <div className="contact-container">
      <h2>Contactar a {sellerName}</h2>
      <h5 className="productNameMargin">Producto: {productName}</h5>

      <div className="contact-options">
        <div className="message-option">
          {!message ? (
            <button
              onClick={() =>
                navigate(`/chat/${chatId}`, {
                  state: { productId, sellerId, productName, sellerName, productImage }
                })
              }
              className="send-message-btn messageBtn"
            >
              <span className="message-icon-container">
                <FiMessageCircle className="message-icon" />
              </span>
              Ir al chat
            </button>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí"
              />
              <button onClick={handleSendMessage} className="send-message-btn messageBtn">
                <span className="message-icon-container">
                  <FiMessageCircle className="message-icon" />
                </span>
                Enviar mensaje
              </button>
            </>
          )}
        </div>

        <div className="whatsapp-option">
          <p>O contactar por WhatsApp</p>
          <button onClick={handleWhatsAppClick} className="whatsapp-btn compact">
            <span className="whatsapp-icon-container">
              <FaWhatsapp className="whatsapp-icon" />
            </span>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  ); */



