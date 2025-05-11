import React, { useEffect, useRef, useState } from "react";
import chip from "../../assets/chip-tarjeta.png";
import visa from '../../assets/logos/visa.png';
import mastercard from '../../assets/logos/mastercard.png'
import styles from "./cardForm.module.css";
import { Link } from "react-router-dom";
import { Plus, Minus } from "lucide-react";

const CreditCardForm = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("#### #### #### ####");
  const [cardName, setCardName] = useState("Jhon Doe");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [ccv, setCcv] = useState("");
  const [logoSrc, setLogoSrc] = useState("");
  const [isEnglish, setIsEnglish] = useState(true);

  const toggleFlip = () => setIsFlipped(!isFlipped);

  const toggleForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFormVisible(!isFormVisible);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
    value = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(value || "");

    if (value.startsWith("4")) {
      setLogoSrc(visa);
    } else if (value.startsWith("5")) {
      setLogoSrc(mastercard);
    } else {
      setLogoSrc("");
    }
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setCardName(value);
  };

  const currentYear = new Date().getFullYear();
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const years = Array.from({ length: 9 }, (_, i) => (currentYear + i).toString());

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tarjeta guardada!');
  };

  return (
    <div className={styles.contenedorCardForm}>
      <div className={styles.tarjetaContainer}>
        <button onClick={toggleLanguage} className={styles.botonCambioEspanish}>
          {isEnglish ? 'Español' : 'English'}
        </button>

        <h5 className={styles.avisoh5}>
          {isEnglish ? (
            <>
              We're not working with any store yet. If you're interested in working with us, contact us:{' '}
              <Link className={styles.linkContactoAviso} to="/Contact us">Contact us</Link>
            </>
          ) : (
            <>
              Aún no estamos trabajando con ninguna tienda, si tenés interés en trabajar con nosotros contáctanos:{' '}
              <Link className={styles.linkContactoAviso} to="/Contact us">Contactanos</Link>
            </>
          )}
        </h5>
        
        
        {/* Tarjeta */}
        <section
          className={`${styles.tarjeta} ${isFlipped ? styles.active : ""}`}
          onClick={toggleFlip}
        >
          {/* Delantera */}
          <div className={styles.delantera}>
            <div className={styles["logo-marca"]}>
              {logoSrc && <img src={logoSrc} alt="Logo" />}
            </div>
            <img src={chip} className={styles.chip} alt="Chip" />
            <div className={styles.datos}>
              <div className={styles.grupo}>
                <p className={styles.label}>{isEnglish ? "Card Number" : "Número Tarjeta"}</p>
                <p className={styles.numero}>{cardNumber}</p>
              </div>
              <div className={styles.flexbox}>
                <div className={`${styles.grupo} ${styles.nombreContainer}`}>
                  <p className={styles.label}>{isEnglish ? "Card Name" : "Nombre Tarjeta"}</p>
                  <p className={styles.nombre}>{cardName}</p>
                </div>
                <div className={styles.grupo}>
                  <p className={styles.label}>{isEnglish ? "Expiration" : "Expiracion"}</p>
                  <p className={styles.expiracion}>
                    <span className={styles.mes}>{expMonth}</span> /{" "}
                    <span className={styles.year}>{expYear}</span>
                  </p>
                </div>
              </div>
            </div>
          </div> 

          {/* Tarjeta trasera */}
          <div className={styles.trasera}>
            <div className={styles["barra-magnetica"]}></div>
            <div className={styles.datos2}>
              <div className={`${styles.grupo} ${styles.grupo1}`} id="firma">
                <p className={styles.label}>{isEnglish ? "Signature" : "Firma"}</p>
                <div className={styles.firma}><p></p></div>
              </div>
              <div className={`${styles.grupo} ${styles.grupo2}`} id="ccv">
                <p className={styles.label}>CCV</p>
                <p className={`${styles.ccv} ${styles.ccv2}`}> {ccv} </p>
              </div>
            </div>
            <p className={styles.leyenda}>
              {isEnglish ? "All transactions are securely encrypted" : "Todas las transacciones están encriptadas"}
            </p>
            <a href="#" className={styles["link-banco"]}>www.cryptoweb.com</a>
          </div>   
        </section>

        {/* Contenedor Boton Abrir Formulario */}
        <div className={styles["contenedor-btn"]}>
          <button
            type="button"
            className={`${styles["btn-abrir-formulario"]} ${isFormVisible ? styles.active : ""}`}
            onClick={toggleForm}
          > 
            {isFormVisible ? <Minus size={20} /> : <Plus size={20} />} 
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className={styles.formContainer}>
        <form 
          ref={useRef<HTMLFormElement>(null)}
          className={`${styles["formulario-tarjeta"]} ${isFormVisible ? styles.visible : ""}`}
          onSubmit={handleSubmit}
        >
          <div className={styles.formWrapper}>
            <h2 className={styles.loginTitle}>
              {isEnglish ? "Add Card" : "Agregar Tarjeta"}
            </h2>
            
            <div className={styles.mb4}>
              <label htmlFor="cardNumber" className={styles.label}>
                {isEnglish ? "Card Number" : "Número de Tarjeta"}
              </label>
              <input
                type="text"
                id="cardNumber"
                className={styles.formInput}
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder={isEnglish ? "#### #### #### ####" : "#### #### #### ####"}
                required
              />
            </div>

            <div className={styles.mb4}>
              <label htmlFor="cardName" className={styles.label}>
                {isEnglish ? "Name on Card" : "Nombre en la Tarjeta"}
              </label>
              <input
                type="text"
                id="cardName"
                className={styles.formInput}
                value={cardName}
                onChange={handleCardNameChange}
                placeholder="Jhon Doe"
                required
              />
            </div>

            <div className={styles.flexContainer}>
              <div className={styles.mb4}>
                <label htmlFor="expMonth" className={styles.label}>
                  {isEnglish ? "Expiration Month" : "Mes de Expiración"}
                </label>
                <select
                  id="expMonth"
                  className={styles.formInput}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  required
                >
                  <option value="">{isEnglish ? "MM" : "MM"}</option>
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div className={styles.mb4}>
                <label htmlFor="expYear" className={styles.label}>
                  {isEnglish ? "Expiration Year" : "Año de Expiración"}
                </label>
                <select
                  id="expYear"
                  className={styles.formInput}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  required
                >
                  <option value="">{isEnglish ? "YYYY" : "AAAA"}</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className={styles.mb4}>
                <label htmlFor="ccv" className={styles.label}>CCV</label>
                <input
                  type="text"
                  id="ccv"
                  className={styles.formInput}
                  value={ccv}
                  onChange={(e) => setCcv(e.target.value)}
                  placeholder="123"
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitButton}>
              {isEnglish ? "Save Card" : "Guardar Tarjeta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardForm;