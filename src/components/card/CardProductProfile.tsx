import { useContext, useState } from "react";
import { Product } from "@/types/productType";
import { FaTrash, FaEdit } from "react-icons/fa";
import "./cardProductProfile.css";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CircleX } from 'lucide-react';

interface UserReference {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  description?: string;
  rating?: number;
}

interface CardProps {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  image: string;
  seller: UserReference;
  className?: string;
  onRemove: (productId: string) => void;
  // Propiedades opcionales
  description?: string;
  currencyType: 'usd' | 'ars'
  specifications?: Record<string, string>;
  sellerType?: 'official' | 'fictional' | 'user';
  isFavorite?: boolean; 
}
const CardProductProfile = (props: CardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // Manejo seguro del contexto
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { user } = authContext;

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("ID del producto a eliminar:", props._id); // Verifica que esto muestre el ID correcto
    props.onRemove(props._id);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/edit-product/${props._id}`);
  }

  const imageUrl = props.image.replace(/\\/g, '/');

  return (
    <div
    className={`myCardContainer ${isFlipped ? "flipped" : ""} ${
      props.isFavorite ? "myClasesita" : ""
    }`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Lado frontal */}
      <div className="cardFront">
        <span className="starContainer" onClick={handleRemove}>
          {/* <FaTrash className="deleteIcon" /> */}
          <CircleX />
        </span>
        <div className="imagenContainer">
          <img src={imageUrl} alt={props.name} className="w-full h-auto" />
        </div>
        <div className="cardDataContainer text-center">
          <h5 className="text-lg font-bold homeCardTitle">{props.name}</h5>
          <p className="text-green-400 font-semibold cardPrice"> ${props.price} <span>{props.currencyType}</span> </p>
          <hr className="lineSeparator" />
          <div className="dataCard">
            <p className="textLila">{props.category}</p>
            <p className="textYellow">Stock: {props.stock}</p>
          </div>

          <div className="contenedorBotones">

          {!props.isFavorite && (
            <button 
              className="botonAgregar"
              onClick={handleEdit}
            >
              <FaEdit className="inline mr-1 elFaEdit" /> Edit
            </button>
          )}

          </div>
        </div>
      </div>

      {/* Lado trasero (versión estática) */}
      <div className="cardBack">
        <div className="sellerInfoContainer">
          <img src={user?.image} alt="Seller" className="userImage" />
          <h6 className="text-lg font-bold h6sellerName">{user?.name}</h6>
        </div>


        <span className="viewProduct">
            View product
        </span>

        <div className="statsContainer">
          <span className="sellerActionButton visitButton disabledButton">
            Visit
          </span>
          <button 
            className="sellerActionButton chatButton disabledButton"
            disabled
          >
            Chat
          </button>
        </div>
      </div>

    </div>
  );
};

export default CardProductProfile;