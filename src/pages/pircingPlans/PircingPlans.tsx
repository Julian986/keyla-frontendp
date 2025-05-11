import { useState, useEffect } from "react";
import './pircingPlans.css'
import Header from "../../components/header/Header";
import Footer from "@/components/Footer/Footer";

type Language = "es" | "en";

type Plan = {
  name: string;
  description: string;
  price: string;
  priceInArs?: string;  // Nuevo campo para precio en pesos
  features: string[];
  cta: string;
  isPopular?: boolean;
  mercadoPagoLink?: string;
};

type Translations = {
  title: string;
  subtitle: string;
  popularBadge: string;
  plans: Plan[];
};

const translations: Record<Language, Translations> = {
  es: {
    title: "Elige el mejor plan para vender más",
    subtitle: "Destaca tus productos y aumenta tus ventas.",
    popularBadge: "PRONTO! AÚN NO DISPONIBLE",
    plans: [
      {
        name: "Plan Básico",
        description: "Para vendedores que comienzan",
        price: "$0/mes",
        features: [
          "Publicación ilimitada de productos",
          "Apareces en resultados de búsqueda",
          "Contacto directo con compradores",
          "Soporte básico por email",
        ],
        cta: "Plan Actual",
      },
      {
        name: "Plan Destacado",
        description: "Maximiza tu visibilidad y ventas",
        price: "$2/mes",
        priceInArs: "$2300 ARS/mes",  // Precio aproximado en pesos
        features: [
          "🔥 Tus productos aparecen PRIMERO en búsquedas",
          "Badge 'Destacado' en tus publicaciones",
          "Estadísticas de visitas a tus productos",
          "Soporte prioritario 24/7",
        ],
        cta: "Seleccionar",
        isPopular: true,
        mercadoPagoLink: "https://link.mercadopago.com.ar/keyla0",
      },
    ],
  },
  en: {
    title: "Choose the best plan to sell more",
    subtitle: "Highlight your products and increase your sales.",
    popularBadge: "SOON! NOT AVAILABLE YET",
    plans: [
      {
        name: "Basic Plan",
        description: "For sellers who are just starting",
        price: "$0/month",
        features: [
          "Unlimited product listings",
          "Appear in search results",
          "Direct contact with buyers",
          "Basic email support",
        ],
        cta: "Current Plan",
      },
      {
        name: "Featured Plan",
        description: "Maximize your visibility and sales",
        price: "$2/month",
        priceInArs: "$2300 ARS/month",  // Precio en pesos para versión en inglés
        features: [
          "🔥 Your products appear FIRST in searches",
          "Featured badge on your listings",
          "Product visit statistics",
          "Priority 24/7 support",
        ],
        cta: "Select",
        isPopular: true,
        mercadoPagoLink: "link.mercadopago.com.ar/keyla0",
      },
    ],
  },
};

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");

     useEffect(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }, []);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan.name);
    if (plan.mercadoPagoLink) {
      window.open(plan.mercadoPagoLink, "_blank");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  const currentTranslations = translations[language];

  return (
    <>
    <Header />
    <div className="min-h-screen bg-black p-6 mt-5">
      <div className="max-w-4xl mx-auto">
        {/* Botón de cambio de idioma */}
        <div className="flex justify-end mb-1 mt-4">
          <button
            onClick={toggleLanguage}
            className="buttonToggleLanguage w-36 h-8 bg-gray-800 text-white transition-colors text-sm rounded-[7px]"
            >
            {language === "es" ? "English" : "Español"}
          </button>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          {currentTranslations.title}
        </h2>
        <p className="text-center text-gray-400 mb-8">
          {currentTranslations.subtitle}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {currentTranslations.plans.map((plan, index) => (
            <div
            key={index}
            className={`planContainer p-6 rounded-lg border ${
              plan.isPopular
              ? "border border-purple-500 transform scale-105 bg-gray-900"
              : "border border-gray-700 bg-gray-800"
            }`}
            >
              {plan.isPopular && (
                <div className="flame-button text-white text-white text-xs font-bold px-2 py-1 rounded-full inline-block mb-2">
                  {currentTranslations.popularBadge}
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2 text-white">
                {plan.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">{plan.price}</p>
                {plan.priceInArs && (
                  <p className="text-lg text-gray-300 mt-1">{plan.priceInArs}</p>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-green-400">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full h-8 px-4 rounded-md font-medium transition-all ${
                  plan.isPopular
                    ? "text-white botonPlan"
                    : "text-gray-200 botonPlan2"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    <Footer />
  </>
  );
};

export default PricingPlans;