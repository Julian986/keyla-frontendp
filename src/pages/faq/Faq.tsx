import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer/Footer";
import './faq.css'

type AccordionItem = {
  question: string;
  answer: string;
};

type Language = 'es' | 'en';

const faqData: Record<Language, AccordionItem[]> = {
  es: [
    {
      question: "¿Qué tipos de productos puedo encontrar en el marketplace?",
      answer: "Ofrecemos una amplia variedad de productos gaming, incluyendo teclados mecánicos, mouses, monitores de alta tasa de refresco, placas de video, sillas gamer y más."
    },
    {
      question: "¿Cómo puedo pagar mi compra?",
      answer: "Aceptamos múltiples métodos de pago, incluyendo tarjetas de crédito y débito, transferencias bancarias y plataformas digitales como PayPal y MercadoPago."
    },
    {
      question: "¿Tienen tienda física?",
      answer: "No, Todavia no estamos trabajando con ninguna tienda. Si tienes interes en trabajar con nosotros contactanos."
    },
    {
      question: "¿Puedo vender mis productos en su marketplace?",
      answer: "Sí, si eres un vendedor interesado en ofrecer tus productos en nuestro marketplace, contáctanos para más información sobre cómo registrarte."
    },
    {
      question: "¿Puedo negociar el precio de un producto?",
      answer: "Depende del vendedor. Algunos productos tienen precios fijos, pero puedes enviar una oferta al vendedor si la opción está disponible."
    },
    {
      question: "¿Cómo puedo contactar con soporte si tengo un problema con mi compra?",
      answer: "Puedes comunicarte con nuestro equipo de soporte a través del chat en línea, correo electrónico o WhatsApp."
    },
    {
      question: "¿Cómo sé si un producto es compatible con mi PC?",
      answer: "En cada producto encontrarás detalles técnicos y requisitos de compatibilidad. Si tienes dudas, nuestro equipo de soporte puede asesorarte."
    },
    {
      question: "¿Qué hago si mi producto llega con defectos de fábrica?",
      answer: "Si tu producto llega con defectos de fábrica, contáctanos de inmediato para gestionar un reemplazo o reembolso."
    },
    {
      question: "¿Cómo puedo seguir el estado de mi pedido?",
      answer: "Te enviaremos un número de seguimiento una vez que tu pedido haya sido despachado para que puedas monitorear su estado en tiempo real."
    },
    {
      question: "¿Qué marcas de productos gaming venden?",
      answer: "Trabajamos con marcas reconocidas como Razer, Logitech, Corsair, ASUS, MSI, HyperX, entre otras."
    }
  ],
  en: [
    {
      question: "What types of products can I find in the marketplace?",
      answer: "We offer a wide variety of gaming products, including mechanical keyboards, mice, high refresh rate monitors, graphics cards, gaming chairs, and more."
    },
    {
      question: "How can I pay for my purchase?",
      answer: "We accept multiple payment methods, including credit and debit cards, bank transfers, and digital platforms like PayPal and MercadoPago."
    },
    {
      question: "Do you have a physical store?",
      answer: "No, we don't currently work with any physical stores. If you're interested in working with us, please contact us."
    },
    {
      question: "Can I sell my products on your marketplace?",
      answer: "Yes, if you're a seller interested in offering your products on our marketplace, contact us for more information on how to register."
    },
    {
      question: "Can I negotiate the price of a product?",
      answer: "It depends on the seller. Some products have fixed prices, but you can send an offer to the seller if the option is available."
    },
    {
      question: "How can I contact support if I have a problem with my purchase?",
      answer: "You can reach our support team through online chat, email, or WhatsApp."
    },
    {
      question: "How do I know if a product is compatible with my PC?",
      answer: "Each product includes technical details and compatibility requirements. If you have doubts, our support team can advise you."
    },
    {
      question: "What should I do if my product arrives with manufacturing defects?",
      answer: "If your product arrives with manufacturing defects, contact us immediately to arrange a replacement or refund."
    },
    {
      question: "How can I track my order status?",
      answer: "We will send you a tracking number once your order has been shipped so you can monitor its status in real time."
    },
    {
      question: "What gaming product brands do you sell?",
      answer: "We work with recognized brands such as Razer, Logitech, Corsair, ASUS, MSI, HyperX, among others."
    }
  ]
};

const Accordion = () => {
  const [language, setLanguage] = useState<Language>('en');
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  return (
    <>
      <Header />
      <div className="faqContainer">
        <div className="language-toggle-container">
          <button 
            onClick={toggleLanguage}
            className="language-toggle"
          >
            {language === 'es' ? 'English' : 'Español'}
          </button>
          <h2 className="faqTitle">
            {language === 'es' ? 'Preguntas frecuentes' : 'Frequently asked questions'}
          </h2>
        </div>
        <div className="w-full max-w-2xl mx-auto space-y-4">
          {faqData[language].map((item, index) => (
            <AccordionItemComponent 
              key={index} 
              question={item.question} 
              answer={item.answer} 
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

const AccordionItemComponent = ({ question, answer }: AccordionItem) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <div className="faqRow border-b">
      <button
        className="w-full text-left py-3 px-4 font-semibold text-gray-800 focus:outline-none flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="faqQuestion">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="faqArrow"
        >
          ▼
        </motion.div>
      </button>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden px-4"
      >
        <p className="faqAnswer py-2">{answer}</p>
      </motion.div>
    </div>
  );
};

export default Accordion;