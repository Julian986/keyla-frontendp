import { Routes, Route, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductDetail from './ProductDetail';
import { Product } from '../../types/productType'


export const ProductDetailWrapper = () => {
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      // Verificar si productId es válido antes de hacer la petición
      if (!productId || productId === "undefined") {
        setError("ID de producto inválido");
        setLoading(false);
        return;
      }
  
      console.log("Llego a ProductDetail")
      const fetchProduct = async () => {
        try {
          const response = await axios.get<Product>(
            `${import.meta.env.VITE_BACKEND_URL}/products/${productId}`
          );
          setProduct(response.data);
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Error al cargar el producto");
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    }, [productId]);
  
    if (loading) return <div>Cargando...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Producto no encontrado</div>;
  
    return <ProductDetail product={product} />;
  };