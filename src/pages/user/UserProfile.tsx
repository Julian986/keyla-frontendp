import { FaCog, FaUserEdit } from "react-icons/fa";
import Header from "@/components/header/Header";
import Footer from "../../components/Footer/Footer";
import "./userProfile.css";
import teclado from '../../../public/teclado1-removebg-preview.png'
import CardProductProfile from "@/components/card/CardProductProfile";
import { IoMdAdd } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/productType";
import axios from "axios";
import { Link } from "react-router-dom";
import userImage from '../../../public/userProfile2.png'
import userImagennnn from '../../../public/userProfile2.png'
import ConfirmationModal from "@/components/confirmationModal/ConfirmationModal";
import { BsDoorOpenFill } from "react-icons/bs";
import {jwtDecode} from "jwt-decode";
import { useCart } from "@/context/CartContext";
import { BiSolidDoorOpen } from "react-icons/bi";
import { useToast } from "@/context/ToastContext";


const ProfileComponent = () => {
  const [selectedTab, setSelectedTab] = useState("products_for_sale");
  const [products, setProducts] = useState<Product[]>([]);
  const [favouriteProducts, setFavouriteProducts] = useState<Product[]>([]);
 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeletingFavourite, setIsDeletingFavourite] = useState(false);
  const auth = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { clearCart } = useCart();
  const { showToast } = useToast();

  const isTokenExpired = (token: string):boolean => {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if(token){
      if(isTokenExpired(token)) {
        auth?.logout();
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [auth]);

  const handleLogout = (e:any) => {
    e.preventDefault();
    auth?.logout();
    clearCart();
    setTimeout(() => {
      showToast("You have successfully logged out.");
    }, 530);
    navigate("/");
  };

  const handleUnauthenticatedAction = () => {
    showToast("You must log in to perform this action.");
  };

  const confirmDelete = (productId: string, isFavourite: boolean = false) => {
    setProductToDelete(productId);
    setIsDeletingFavourite(isFavourite);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      if (isDeletingFavourite) {
        await handleRemoveFavourite(productToDelete);
      } else {
        await handleRemoveProductsForSale(productToDelete);
      }
    } finally {
      setIsModalOpen(false);
      setProductToDelete(null);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {                               
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/products`, {
          headers: { "x-auth-token": auth?.token }
        });
        
        console.log("Datos crudos de productos:", response.data);
        
        const isProduct = (item: any): item is Product => {
          return item && 
                typeof item._id !== 'undefined' && 
                typeof item.name === 'string' && 
                typeof item.price === 'number';
        };

        const validatedProducts = response.data
          .filter(isProduct)
          .map((product: Product) => ({
            ...product,
            _id: product._id.toString(),
            seller: product.seller?.toString()
          }));
        console.log("Productos validados:", validatedProducts);
        setProducts(validatedProducts);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        showToast("Error al cargar productos", {
          backgroundColor: "#FFF",
          textColor: "grey"
        });
      }
    };

    const fetchFavouriteProducts = async () => {
      try {                                         
        const response = await axios.get<Product[]>(`${import.meta.env.VITE_BACKEND_URL}/user/favourites`, {
          headers: { "x-auth-token": auth?.token }
        });
        
        console.log("Datos crudos de favoritos:", response.data);
        
        const validatedProducts = (response.data
          .map(product => {
            if (!product._id) {
              console.warn("Producto sin ID válido:", product);
              return null;
            }
            return {
              ...product,
              _id: product._id.toString()
            };
          })
          .filter((product): product is Product => product !== null)) as Product[];
        
        console.log("Productos validados:", validatedProducts);
        setFavouriteProducts(validatedProducts);
      } catch (error) {
        console.error("Error al obtener productos favoritos:", error);
        showToast("Error al cargar favoritos", {
          backgroundColor: "#FFF",
          textColor: "grey"
        });
      }
    };
    
    if(auth?.token) {
      fetchProducts();
      fetchFavouriteProducts();
    }
    
  }, [auth?.token]);
  
  const handleRemoveFavourite = async (productId: string) => {
    if (!auth?.token) {
      showToast("You must log in for this action", {
        backgroundColor: "#FFF",
        textColor: "grey"
      });
      return;
    }

    console.log("Intentando eliminar favorito, productId:", productId);

    if (!productId || productId.trim() === "") {
        console.error("Empty or invalid product ID");
        showToast("Empty or invalid product ID", {
          backgroundColor: "#FFF",
          textColor: "grey"
        });
        return;
    }

    try {
        console.log("Enviando petición para eliminar favorito...");
        
        const response = await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/user/remove-favourite`,
            {
                data: { 
                    productId: productId 
                },
                headers: {
                    'x-auth-token': auth.token,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Respuesta del servidor:", response.data);

        if (response.data.success) {
            setFavouriteProducts(prev => prev.filter(product => product._id !== productId));
            showToast("Product removed from favourites");
        } else {
            showToast(response.data.message || "No se pudo eliminar de favoritos");
        }
    } catch (error) {
        console.error("Error al eliminar de favoritos:", error);
        
        if (axios.isAxiosError(error)) {
            console.error("Detalles del error:", {
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
            
            if (error.response?.status === 400) {
              showToast(error.response.data.message || "Error en la solicitud");
            } else if (error.response?.status === 401) {
              showToast("Sesión expirada. Por favor inicia sesión nuevamente");
            } else {
              showToast(error.response?.data.message || "Error al eliminar de favoritos");
            }
        } else {
          showToast("Error desconocido al eliminar de favoritos");
        }
    }
  };

  const handleRemoveProductsForSale = async (productId: string) => {
    if (!auth?.token) {
      showToast("You must log in to perform this action.");
      return;
    }

    console.log("Intentando eliminar producto a la venta, ID:", productId);

    if (!productId || productId.trim() === "") {
      showToast("ID de producto no válido", {
        backgroundColor: "#FFF",
        textColor: "grey"
      });
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/user/remove-product-for-sale`,
        {
          data: { productId },
          headers: {
            'x-auth-token': auth.token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Respuesta del backend:", response.data);

      if (response.status === 200) {
        setProducts(prev => prev.filter(product => product._id !== productId));
        showToast("Producto eliminado correctamente", {
          backgroundColor: "#FFF",
          textColor: "grey"
        });
      } else {
        showToast(response.data.message || "No se pudo eliminar el producto", {
          backgroundColor: "#FFF",
          textColor: "grey"
        });
      }
    } catch (error) {
      console.error("Error completo al eliminar producto:", error);
      
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", {
          status: error.response?.status,
          data: error.response?.data
        });
        
        if (error.response?.status === 400) {
          showToast(error.response.data.message || "Error en la solicitud", {
            backgroundColor: "#FFF",
            textColor: "grey"
          });
        } else if (error.response?.status === 401) {
          showToast("No autorizado - sesión expirada", {
            backgroundColor: "#FFF",
            textColor: "grey"
          });
        } else if (error.response?.status === 404) {
          showToast("Producto no encontrado", {
            backgroundColor: "#FFF",
            textColor: "grey"
          });
        } else {
          showToast(error.response?.data.message || "Error al eliminar producto", {
            backgroundColor: "#FFF",
            textColor: "grey"
          });
        }
      } else {
        showToast("Error desconocido al eliminar producto", {
          backgroundColor: "#FFF",
          textColor: "grey"
        });
      }
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "products_for_sale":
        if(products.length == 0) {
          return <h4 className="messageProductsh4">You don´t have any products for sale</h4>;
        } else {
          return products.map((product) => (
            <CardProductProfile 
              key={product._id} 
              className='myCardProduct' {...product}  
              isFavorite={false}
              onRemove={() => confirmDelete(product._id, false)} />
          ));
        }

      case "favorite_products":
        if (favouriteProducts.length === 0) {
          return <h4 className="messageProductsh4">You don't have any favorite products</h4>;
        } else {
          return favouriteProducts.map((product) => (
            <CardProductProfile 
              key={product._id}
              _id={product._id}
              name={product.name}
              price={product.price}
              brand={product.brand}
              stock={product.stock}
              category={product.category}
              image={product.image}
              seller={product.seller}
              currencyType={product.currencyType}
              className="myCardProduct" 
              isFavorite={true}
              onRemove={() => confirmDelete(product._id, true)}
            />
          ));
        }
    }
  };

  return (
    <>
      <Header />
    
      <div className="profileContainer bg-black text-white min-h-screen flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-4xl">
          {/* Header del perfil - reorganizado para móviles */}
          <div className="profile-header flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-0">
            {/* Información del usuario */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="imageProfileContainer w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-700 flex items-center justify-center">
                <img
                  src={(auth?.user?.image?.length ?? 0) > 1 ? auth?.user?.image : userImagennnn}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              
              <div className="userInfoContainer text-center md:text-left">
                <h2 className="userNameh2 text-xl md:text-2xl font-bold">
                  {auth?.user?.name || "Username"}
                </h2>
                <p className="text-gray-400 text-sm md:text-base">{auth?.user?.email || ""}</p>
  
                {/* Nuevos campos */}
                {auth?.user?.location && (
                  <p className="text-gray-400 text-sm md:text-base">📍 {auth.user.location}</p>
                )}
                {auth?.user?.phone && (
                  <p className="text-gray-400 text-sm md:text-base">📞 {auth.user.phone}</p>
                )}
              </div>
            </div>

            {/* Descripción debajo del perfil */}
            {auth?.user?.description && (
              <p className="lasDescription text-gray-300 text-center md:text-left text-sm md:text-base">
                {auth.user.description}
              </p>
            )}
  
            {/* Botones de acciones - con iconos más grandes en móviles */}
            <div className="flex gap-2 md:gap-3 justify-center md:justify-end w-full md:w-auto mt-2 md:mt-0">
              {/* Botón Edit Profile */}
              {isAuthenticated ? (
                <Link to="/userForm" className="addProduct">
                  <button className="userBtn flex items-center justify-center gap-2 px-3 py-2 md:px-3 md:py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <FaUserEdit className="text-2xl md:text-lg" />
                    <span className="hidden md:block text-sm md:text-base">Edit Profile</span>
                  </button>
                </Link>
              ) : (
                <button 
                  onClick={handleUnauthenticatedAction}
                  className="userBtn flex items-center justify-center gap-2 px-3 py-2 md:px-3 md:py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaUserEdit className="text-2xl md:text-lg" />
                  <span className="hidden md:block text-sm md:text-base">Edit Profile</span>
                </button>
              )}

              {/* Botón Add Product */}
              {isAuthenticated ? (
                <Link to="/productForm" className="addProduct">
                  <button className="userBtn flex items-center justify-center gap-2 px-3 py-2 md:px-3 md:py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <IoMdAdd className="text-3xl md:text-lg" />
                    <span className="hidden md:block text-sm md:text-base">Add product</span>
                  </button>
                </Link>
              ) : (
                <button 
                  onClick={handleUnauthenticatedAction}
                  className="userBtn flex items-center justify-center gap-2 px-3 py-2 md:px-3 md:py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <IoMdAdd className="text-3xl md:text-lg" />
                  <span className="hidden md:block text-sm md:text-base">Add product</span>
                </button>
              )}

              {/* Botón Logout/Login */}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="userBtn flex items-center justify-center gap-2 px-3 py-2 md:px-3 md:py-2 bg-transparent hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <BiSolidDoorOpen className="dorsita text-2xl md:text-lg" />
                  <span className="hidden md:block text-sm md:text-base">Logout</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="userBtn flex items-center justify-center gap-2 px-3 py-2 md:px-3 md:py-2 bg-transparent hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <BiSolidDoorOpen className="dorsita text-2xl md:text-lg" />
                  <span className="hidden md:block text-sm md:text-base">Login</span>
                </Link>
              )}
            </div>
          </div>
  
        </div>
  
        {/* Sección de inventario */}
        <div className="w-full max-w-4xl mt-6 px-2 md:px-0">
          <h3 className="text-lg md:text-xl font-semibold border-b border-gray-700 pb-2">
            Inventory
          </h3>
          
          {/* Pestañas - scroll horizontal en móviles */}
          <div className="tab-container overflow-x-auto whitespace-nowrap py-2 md:py-0">
            <div className="flex space-x-2 md:space-x-4 mt-2 md:mt-4 w-max md:w-full">
              <button
                className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base ${
                  selectedTab === "products_for_sale" 
                    ? "text-white border-b-2 border-blue-500" 
                    : "text-gray-400"
                }`}
                onClick={() => setSelectedTab("products_for_sale")}
              >
                On Sale
              </button>
       
              <button
                className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base ${
                  selectedTab === "favorite_products" 
                    ? "text-white border-b-2 border-blue-500" 
                    : "text-gray-400"
                }`}
                onClick={() => setSelectedTab("favorite_products")}
              >
                Favourites
              </button>
            </div>
          </div>
  
          {/* Grid de productos - responsivo */}
          <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4">
            {renderContent()}
          </div>
        </div>
      </div>
  
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${isDeletingFavourite ? 'Favourite' : 'Product'}`}
        message={`Are you sure you want to delete this ${isDeletingFavourite ? 'favourite' : 'product'}? This action cannot be undone.`}
      />
  
      <Footer />
    </>
  );
};

export default ProfileComponent;