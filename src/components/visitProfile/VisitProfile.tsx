import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../header/Header';
import Footer from '../Footer/Footer';
import CardProduct from '../card/CardProduct';
import userImage from '../../../public/userProfile.png';
import { Product } from '@/types/productType';
import { FaUserEdit, FaCog } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { BiSolidDoorOpen } from 'react-icons/bi';

interface CardProductProps {
  className: string;
  userId: string;
  _id: string;
  image: string;
  name: string;
  price: string;
  brand: string;
  stock: string;
  description: string;
  userImage: string;
  sellerName: string;
  currencyType: 'usd' | 'ars';
  condition: 'Used' | 'New';
  sellerType: 'official' | 'fictional' | 'user';
  location: string;
}

const VisitProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedTab, setSelectedTab] = useState("products_for_sale");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función mejorada para obtener props seguros para CardProduct
    const getSafeCardProductProps = (product: Product): CardProductProps => {
        if (!user) {
            throw new Error("User data not available");
        }

        return {
            className: 'myCardProduct',
            userId: user._id,
            _id: product._id || `temp-id-${Math.random().toString(36).substr(2, 9)}`,
            image: product.image || '/default-product.jpg',
            name: product.name || 'Unnamed Product',
            price: (product.price ?? 0).toString(),
            brand: product.brand || 'Generic Brand',
            stock: (product.stock ?? 0).toString(),
            description: product.description || 'No description available',
            userImage: user.image || userImage,
            sellerName: user.name || 'Unknown Seller',
            currencyType: product.currencyType || 'usd',
            condition: product.condition || 'New',
            sellerType: product.sellerType || 'user',
            location: user.location || 'Location not specified'
        };
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null); 
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/profile/${userId}`);
                console.log("API Response:", response.data);
                
                if (!response.data?.user) {
                    throw new Error("User data not found in response");
                }
                
                setUser(response.data.user);
                
                // Procesamiento más robusto de los productos
                const productsFromApi = response.data.user.products_for_sale || [];
                
                const validatedProducts = productsFromApi
                    .filter((product: any) => product && (product._id || product.id))
                    .map((product: any) => ({
                        ...product,
                        _id: (product._id || product.id).toString(),
                        // Asegurar que los campos numéricos sean números
                        price: Number(product.price) || 0,
                        stock: Number(product.stock) || 0,
                        // Asegurar campos de texto
                        name: product.name || 'Unnamed Product',
                        description: product.description || 'No description',
                        brand: product.brand || 'Generic Brand',
                        // Asegurar campos de enumeración
                        currencyType: ['usd', 'ars'].includes(product.currencyType) ? 
                            product.currencyType : 'usd',
                        condition: ['Used', 'New'].includes(product.condition) ? 
                            product.condition : 'New',
                        sellerType: ['official', 'fictional', 'user'].includes(product.sellerType) ? 
                            product.sellerType : 'user'
                    }));
                
                console.log("Validated Products:", validatedProducts);
                setProducts(validatedProducts);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setError("Failed to load user profile. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchUserProfile();
    }, [userId]);

    const renderContent = () => {
        if (loading) {
            return <div className="text-center py-5">Loading products...</div>;
        }

        if (error) {
            return <div className="text-center py-5 text-red-400">{error}</div>;
        }

        switch (selectedTab) {
            case "products_for_sale":
                if (products.length === 0) {
                    return <h4 className="messageProductsh4 text-center py-5">
                        This user doesn't have any products for sale
                    </h4>;
                } else {
                    return products.map((product) => (
                        <CardProduct
                            key={product._id}
                            {...getSafeCardProductProps(product)}
                        />
                    ));
                }
            default:
                return null;
        }
    };

    if (loading && !user) {
        return (
            <div className="bg-black text-white min-h-screen flex items-center justify-center">
                Loading user profile...
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="bg-black text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-red-400 mb-4">Error loading profile</h3>
                    <p>{error}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
    
            <div className="profileContainer bg-black text-white min-h-screen flex flex-col items-center p-4 md:p-6">
                <div className="w-full max-w-4xl">
                    {/* Header del perfil */}
                    <div className="profile-header flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-0">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="imageProfileContainer w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                <img
                                    src={user?.image || userImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = userImage;
                                    }}
                                />
                            </div>
                            
                            <div className="userInfoContainer text-center md:text-left">
                                <h2 className="userNameh2 text-xl md:text-2xl font-bold">
                                    {user?.name || "Username"}
                                </h2>
                                <p className="text-gray-400 text-sm md:text-base">
                                    {user?.email || ""}
                                </p>
            
                                {user?.location && (
                                    <p className="text-gray-400 text-sm md:text-base">
                                        📍 {user.location}
                                    </p>
                                )}
                                {user?.phone && (
                                    <p className="text-gray-400 text-sm md:text-base">
                                        📞 {user.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {user?.description && (
                        <p className="lasDescription mt-4 text-gray-300 text-center md:text-left text-sm md:text-base">
                            {user.description}
                        </p>
                    )}
                </div>
    
                {/* Sección de inventario */}
                <div className="w-full max-w-4xl mt-6 px-2 md:px-0">
                    <h3 className="text-lg md:text-xl font-semibold border-b border-gray-700 pb-2">
                        Inventory
                    </h3>
                    
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
                        </div>
                    </div>
    
                    <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4">
                        {renderContent()}
                    </div>
                </div>
            </div>
    
            <Footer />
        </>
    );
};

export default VisitProfile;