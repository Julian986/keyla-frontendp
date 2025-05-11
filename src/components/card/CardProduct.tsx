import { useState, useContext, useEffect } from "react";
import "./cardProduct.css";
import { IoIosStarOutline } from "react-icons/io";
import { BookMarked } from 'lucide-react';
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import imagen from '../../../public/1ryzen.png';
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import ContactSellerModal from "../../pages/contactSeller/ContactSeller";
import { FiMessageCircle } from "react-icons/fi";
import { ShoppingCart } from 'lucide-react';
import { Toast, ToastContainer } from "react-bootstrap";
import { useToast } from "@/context/ToastContext";

interface CardProps {
  userId: string;
  _id: string;
  image: string;
  name: string;
  price: string;
  brand: string;
  stock: string;
  description: string;
  sellerName: string;
  location: string;
  currencyType: 'usd' | 'ars';
  condition: 'Used' | 'New';
  sellerPhone?: string;
  userImage: string;
  className?: string;
  sellerType: 'official' | 'fictional' | 'user';
}

const CardProduct = (props: CardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const auth = useContext(AuthContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChatClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
     if (!auth?.token) {
      showToast("You must log in to chat with the seller");
      return;
    }

    if (auth.user?._id === props.userId) {
      showToast("You can't chat with yourself");
      return;
    }

    navigate('/contact-seller', {
      state: {
        productId: props._id,
        sellerId: props.userId,
        productName: props.name,
        sellerName: props.sellerName,
        sellerPhone: props.sellerPhone,
        productImage: props.image,
        from: '/'
      },
      replace: true
    }); 
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();

    const priceNumber = parseFloat(props.price);
    const stockNumber = parseInt(props.stock);

    if (isNaN(priceNumber) || isNaN(stockNumber)) {
      /* showToast("Error en los datos del producto", "warning"); */
      return;
    }

    addToCart({
      _id: props._id,
      name: props.name,
      price: priceNumber,
      brand: props.brand,
      stock: stockNumber,
      imageUrl: props.image,
      quantity: 0
    });

    showToast("Product added to cart");

  };

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!auth?.token) return;
       
      try {                             
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/favourites`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        
        const isInFavorites = response.data.some((product: any) => product._id === props._id);
        setIsFavorite(isInFavorites);
      } catch (error) {
        console.error("Error al obtener favoritos:", error);
      }
    };

    checkIfFavorite();
  }, [auth?.token, props._id]);

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!auth?.token) {
      showToast("You must log in to add products to favorites");
      return;
    };

    try {
      if (isFavorite) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/user/remove-favourite`,
          { data: { productId: props._id }, headers: { Authorization: `Bearer ${auth.token}` } }
        );
        setIsFavorite(false);
        showToast("Product removed from favorites");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/user/add-favourite`,
          { productId: props._id },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true
          }
        );
        setIsFavorite(true);
        showToast("Product added to favorites");
      }
    } catch (error: any) {
      console.error("Error al gestionar favoritos:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          showToast("You must log in to perform this action");
        } else if (error.response.data.message === "El producto ya está en favoritos") {
          showToast("This product is already in your favorites");
        }
      } else {
        showToast("Error managing favorites");
      }
    }
  };

  const imageUrl = props.image.replace(/\\/g, '/');

  return (
    <>
      <div
        className={`myCardContainer ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Lado frontal */}
        <div className="cardFront">
          <span className="starContainer" onClick={handleToggleFavorite}>
            {isFavorite ? (
              <FaStar className="starFavourite" />
            ) : (
              <CiStar />
            )}
          </span>

          <div className="imagenContainer">
            <img src={imageUrl} alt={props.name} className="w-full h-auto" />
          </div>
          <div className="cardDataContainer text-center">
            <h5 className="text-lg font-bold homeCardTitle">{props.name}</h5>
            <p className="text-green-400 font-semibold cardPrice">${props.price} <span className="currencyType">{props.currencyType}</span> </p>

            <hr className="lineSeparator" />

            <div className="dataCard">
              <p className="textLila">{props.brand}</p>
              <p className="textYellow"> {props.condition}</p>
            </div>

            <div className="contenedorBotones">
              {props.sellerType === 'official' ? (
                <>
                  <Link to="/PaymentForm">
                    <button className="botonComprar">Buy</button>
                  </Link>
                  <button className="botonAgregar" onClick={handleAddToCart}> <ShoppingCart className="elShopping" /> Add to cart </button>
                </>
              ) : (
                <button
                  className="mybotonChat messageBtn2"
                  onClick={handleChatClick}
                  style={{ width: '100%' }}
                >
                  <span className="message-icon-container2">
                    <FiMessageCircle className="message-icon2" />
                  </span>
                  Contact Seller
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lado trasero */}
        <div className="cardBack">
          <div>
            <img src={props.userImage} alt="Seller" className="userImage" />
            <h6 className="text-lg font-bold h6sellerName">{props.sellerName}</h6>
            <h6>📍{props.location}</h6>
          </div>

          <Link to={`/product/${props._id}`} onClick={(e) => e.stopPropagation()}
            className="viewProduct">
            View product
          </Link>
          <div className="statsContainer">
            <Link
              to={`/profile/${props.userId}`}
              onClick={(e) => e.stopPropagation()}
              className="sellerActionButton visitButton"
            >
              Visit
            </Link>
            <button
              onClick={handleChatClick}
              className="sellerActionButton chatButton"
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardProduct;