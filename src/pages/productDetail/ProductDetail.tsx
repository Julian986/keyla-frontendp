import React, { useContext } from 'react';
import { Product } from '../../types/productType';
import './productDetail.css';
import Header from '../../components/header/Header';
import { AuthContext } from '@/context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/context/ToastContext";

interface ProductDetailProps {
  product: Product;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Función para formatear el precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Función para manejar el click en el botón de chat
  const handleChatClick = async () => {
    if (!auth?.token) {
      showToast("Debes iniciar sesión para chatear con el vendedor");
      return;
    }

    if (auth.user?._id === product.seller._id) {
      showToast("You can't chat with yourself");
      return;
    }

    navigate('/contact-seller', {
      state: {
        productId: product._id,
        sellerId: product.seller._id,
        productName: product.name,
        sellerName: product.seller.name,
        sellerPhone: product.seller.phone,
        productImage: product.image,
        from: `/product/${product._id}`
      },
      replace: true
    }); 
  };

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 productDetailWrapper mt-5">
        {/* Contenedor principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-3">
          {/* Sección de imágenes */}
          <div className="space-y-4">
            <div className="productContainerDetail rounded-lg shadow-md overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-contain p-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/tu-cloud/image/upload/v123/default-product.png';
                }}
              />
            </div>
          </div>

          {/* Información del producto */}
          <div>
            {/* Encabezado */}
            <div className="border-b pb-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            </div>

            {/* Precio y disponibilidad */}
            <div className="mt-4">
              <p className="text-3xl font-semibold text-white-900">
                {formatPrice(product.price)} <span className='currencyType'>{product.currencyType}</span>
              </p>
              <p className={`mt-2 text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 
                  ? `Available (${product.stock} units)` 
                  : 'Agotado'}
              </p>
            </div>

{/* Descripción */}
<div className="mt-6">
  <h2 className="text-lg font-medium text-gray-900">Description</h2>
  <p className="mt-2 colorGrey">
    {product.description ? product.description : "Empty"}
  </p>
</div>

{/* Especificaciones técnicas */}
<div className="mt-6">
  <h2 className="text-lg font-medium text-gray-900">Technical specifications</h2>
  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 colorGrey">
    {product.specifications && Object.keys(product.specifications).length > 0 ? (
      Object.entries(product.specifications).map(([key, value]) => (
        <div key={key} className="flex">
          <span className="font-medium w-1/2">{key}:</span>
          <span>{value}</span>
        </div>
      ))
    ) : (
      <span>Empty</span>
    )}
  </div>
</div>

            {/* Botones de acción */}
            <div className="mt-8 flex space-x-4">
              <button
                className="butonWithSeller flex-1 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                disabled={product.stock <= 0}
                onClick={handleChatClick}
              >
                {product.stock > 0 ? 'Chat with Seller' : 'No disponible'}
              </button>
            </div>

            {/* Info del vendedor */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900">Sold by</h3>
              <div className="mt-2 flex items-center">
                <img
                  src={product.seller?.image || 'https://res.cloudinary.com/tu-cloud/image/upload/v123/default-avatar.jpg'}
                  alt={`Vendedor ${product.seller?.name}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-white-900 mt-3">{product.seller?.name || 'Tienda oficial'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;