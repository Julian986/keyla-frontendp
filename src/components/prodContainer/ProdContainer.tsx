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

interface MongoId {
  $oid: string;
}

interface MongoDate {
  $date: string;
}

// Nueva interfaz para Product sin hacer conflicto con _id
interface BaseProduct extends Omit<Product, 'seller' | '_id' | 'createdAt' | 'updatedAt'> {
  _id?: string | MongoId;
  createdAt?: string | MongoDate;
  updatedAt?: string | MongoDate;
  seller?: {
    _id?: string | MongoId;
    name?: string;
    email?: string;
    image?: string;
    phone?: string;
    location?: string;
  };
}

interface ApiProduct extends BaseProduct {
  __v?: number;
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

const SAMPLE_PRODUCTS: ApiProduct[] = [
  {
    _id: "67f97573029284014dbf22bf",
    name: "Intel Core i7-13700KF",
    description: "16 cores without integrated graphics",
    price: 419.99,
    stock: 9,
    category: "Components",
    brand: "Intel",
    image: "https://res.cloudinary.com/dnnxgzqzv/image/upload/v1744369221/micro-intel-core-i713700kf-scooler-svideo-s1700-0-removebg-preview_gstq2f_wd6mhw.webp",
    specifications: {
      Cores: "16 (8P+8E)",
      Threads: "24",
      Frequency: "3.4-5.4GHz",
      Socket: "LGA1700",
      Overclocking: "Unlocked"
    },
    seller: {
      _id: "67e2ad1a2097fb77f4a76cce",
      name: "Intel Official Store"
    },
    sellerType: "official",
    currencyType: "usd",
    condition: "Used",
    createdAt: "2025-03-26T02:06:25.452Z",
    updatedAt: "2025-03-26T02:06:25.452Z"
  },
  {
    _id: "67f97573029284014dbf22c2",
    name: "Corsair RM750x",
    description: "750W 80+ Gold Certified Fully Modular ATX Power Supply",
    price: 119.99,
    stock: 15,
    category: "Components",
    brand: "Corsair",
    image: "https://res.cloudinary.com/dnnxgzqzv/image/upload/v1744307853/CP-9020199-AR-1-removebg-preview_xzaezk_sic0sk.webp",
    specifications: {
      Wattage: "750W",
      Efficiency: "80+ Gold",
      Modular: "Fully modular",
      Connectors: "PCIe, SATA, Molex",
      Warranty: "10 years"
    },
    seller: {
      _id: "67f96c6c02e303fd8201dfe2",
      name: "Corsair Official Store"
    },
    sellerType: "fictional",
    fictionalSellerIndex: 2,
    currencyType: "usd",
    condition: "Used",
    createdAt: "2025-03-19T04:40:11.250Z",
    updatedAt: "2025-03-19T04:40:11.250Z"
  }
];

const ProdContainer = ({ searchTerm }: ProdContainerProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = useContext(AuthContext);
  const { filters } = useFilters();

  // Función para normalizar los productos
  const normalizeProducts = (apiProducts: ApiProduct[]): Product[] => {
    return apiProducts.map((product: ApiProduct) => {
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

      // Helper para obtener el ID correcto
      const getId = (id: string | MongoId | undefined): string => {
        if (!id) return '';
        return typeof id === 'string' ? id : id.$oid;
      };

      // Helper para obtener la fecha correcta
      const getDate = (date: string | MongoDate | undefined): string => {
        if (!date) return new Date().toISOString();
        return typeof date === 'string' ? date : date.$date;
      };

      return {
        ...defaultProduct,
        ...product,
        _id: getId(product._id) || defaultProduct._id,
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
        createdAt: getDate(product.createdAt),
        updatedAt: getDate(product.updatedAt),
        seller: {
          ...defaultSeller,
          ...product.seller,
          _id: getId(product.seller?._id) || defaultSeller._id,
          name: product.seller?.name ?? defaultSeller.name,
          image: product.seller?.image ?? defaultSeller.image,
          location: product.seller?.location ?? defaultSeller.location
        }
      };
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Mostrar productos de muestra inmediatamente
        const sampleNormalized = normalizeProducts(SAMPLE_PRODUCTS);
        setProducts(sampleNormalized);
        applyFilters(sampleNormalized, searchTerm, filters);
        
        // Hacer la llamada real al backend
        const response = await axios.get<ApiProduct[]>(`${import.meta.env.VITE_BACKEND_URL}/products`);
        
        // Normalizar y actualizar los productos reales
        const validProducts = normalizeProducts(response.data);
        setProducts(validProducts);
        applyFilters(validProducts, searchTerm, filters);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
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
  
    if (term) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.brand.toLowerCase().includes(term.toLowerCase())
      );
    }
  
    if (currentFilters.precio) {
      const { min, max } = currentFilters.precio;
      filtered = filtered.filter(
        (product) => product.price >= min && product.price <= max
      );
    }
  
    if (currentFilters.category) {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === currentFilters.category.toLowerCase()
      );
    }
  
    if (currentFilters.brand) {
      filtered = filtered.filter(
        (product) => product.brand.toLowerCase() === currentFilters.brand.toLowerCase()
      );
    }
  
    setFilteredProducts(filtered);
  };

  const getSafeCardProductProps = (product: Product): CardProductProps => {
    return {
      className: isLoading ? 'myCardProduct loading' : 'myCardProduct',
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
            <h4 className='noProductsFound'>
              {isLoading ? 'Loading products...' : 'No products were found matching the filters'}
            </h4>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default ProdContainer;