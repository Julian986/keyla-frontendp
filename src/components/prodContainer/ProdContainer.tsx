import { Container, Row, Col } from 'react-bootstrap';
import './prodContainer.css';
import CardProduct from '../card/CardProduct';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import axios from 'axios';
import { Product } from '../../types/productType';
import { useFilters } from '@/context/FilterContext';

interface ProdContainerProps {
  searchTerm: string;
}

interface ApiProduct extends Omit<Product, 'seller'> {
  seller?: {
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
    phone?: string;
    location?: string;
  };
  
}

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

const ProdContainer = ({ searchTerm }: ProdContainerProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const auth = useContext(AuthContext);
  const { filters } = useFilters();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Buenas tardes");
        const response = await axios.get<ApiProduct[]>(`${import.meta.env.VITE_BACKEND_URL}/products`);
        console.log("Categorías únicas encontradas:", 
          [...new Set(response.data.map(p => p.category))]);
          console.log("Datos recibidos del backend:", response.data.map(p => ({
            name: p.name,
            sellerType: p.sellerType
          })));

        const validProducts: Product[] = response.data.map((product: ApiProduct) => {
          const defaultProduct: Omit<Product, 'seller'> = {
            _id: 'default-id-' + Math.random().toString(36).substr(2, 9),
            name: 'Producto sin nombre',
            description: 'Sin descripción disponible',
            price: 0,
            stock: 0,
            category: 'general',
            brand: 'Genérico',
            image: '/default-product.jpg',
            specifications: {},
            sellerType: 'user',
            currencyType: 'ars',
            condition: 'Used',
            isPreloaded: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          const defaultSeller = {
            _id: 'seller-id-' + Math.random().toString(36).substr(2, 9),
            name: 'Vendedor',
            email: '',
            image: '/default-user.jpg',
            phone: '',
            location: 'unkowed'
          };

          return {
            ...defaultProduct,
            ...product,
            _id: product._id ?? defaultProduct._id,
            name: product.name ?? defaultProduct.name,
            description: product.description ?? defaultProduct.description,
            price: product.price ?? defaultProduct.price,
            stock: product.stock ?? defaultProduct.stock,
            category: product.category ?? defaultProduct.category,
            brand: product.brand ?? defaultProduct.brand,
            image: product.image ?? defaultProduct.image,
            sellerType: product.sellerType ?? defaultProduct.sellerType,
            currencyType: product.currencyType ?? defaultProduct.currencyType,
            condition: product.condition ?? defaultProduct.condition,
            seller: {
              ...defaultSeller,
              ...product.seller,
              _id: product.seller?._id ?? defaultSeller._id,
              name: product.seller?.name ?? defaultSeller.name,
              image: product.seller?.image ?? defaultSeller.image,
              location: product.seller?.location ?? defaultSeller.location
            }
          };
        });

        setProducts(validProducts);
        applyFilters(validProducts, searchTerm, filters);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setFilteredProducts([]);
      }
    };

    fetchProducts();
  }, [auth?.token, searchTerm]);

  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products, searchTerm, filters);
    }
  }, [filters, products, searchTerm]);

  const applyFilters = (products: Product[], term: string, currentFilters: any) => {
    let filtered = [...products];
    console.log("Productos antes de filtrar:", filtered);
    console.log("Filtros actuales:", currentFilters);
  
    // Filtro de búsqueda por texto
    if (term) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.brand.toLowerCase().includes(term.toLowerCase())
      );
    }
  
    // Filtro de precio
    if (currentFilters.precio) {
      const { min, max } = currentFilters.precio;
      filtered = filtered.filter(
        (product) => product.price >= min && product.price <= max
      );
    }
  
    // Filtro de categoría (case-insensitive)
    if (currentFilters.category) {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === currentFilters.category.toLowerCase()
      );
      console.log("Productos después de filtrar por categoría:", filtered);
    }
  
  
    // Filtro de marca (case-insensitive)
    if (currentFilters.brand) {
      filtered = filtered.filter(
        (product) => product.brand.toLowerCase() === currentFilters.brand.toLowerCase()
      );
    }
  
    setFilteredProducts(filtered);
  };

  const getSafeCardProductProps = (product: Product): CardProductProps => {
    return {
      className: 'myCardProduct',
      userId: product.seller._id,
      _id: product._id,
      image: product.image,
      name: product.name,
      price: product.price.toString(),
      brand: product.brand,
      stock: product.stock.toString(),
      description: product.description,
      currencyType: product.currencyType,
      condition: product.condition,
      userImage: product.seller.image ?? '/default-user.jpg',
      sellerName: product.seller.name ?? 'Vendedor desconocido',
      location: product.seller.location ?? 'unknowed',
      /* sellerPhone: product.seller.phone */
      sellerType: product.sellerType 
    };
  };

  return (
    <Container className=''>
      <Row>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: Product) => {
            const cardProps = getSafeCardProductProps(product);
            return (
              <Col 
                key={product._id} 
                xs={12} sm={6} md={6} lg={4} xl={4} xxl={3}
                className='lacolDelaCard'
              >
                <CardProduct {...cardProps} />
              </Col>
            );
          })
        ) : (
          <Col className="text-center py-5">
            <h4 className='noProductsFound'>No products were found matching the filters</h4>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ProdContainer;