import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer/Footer";
import { FaShoppingCart, FaShoppingBag, FaCircle, FaUser, FaExchangeAlt, FaDollarSign, FaTimes } from "react-icons/fa";
import styles from './Tables.module.css';
import { FaArrowRight } from 'react-icons/fa';

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  sales: number;
  purchases: number;
  status: 'active' | 'inactive';
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sales: number;
  stock: number;
  status: 'available' | 'out-of-stock';
}

// Datos ficticios para usuarios
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    sales: 245,
    purchases: 32,
    status: 'active'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@example.com',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    sales: 189,
    purchases: 28,
    status: 'active'
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos@example.com',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    sales: 132,
    purchases: 45,
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@example.com',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
    sales: 98,
    purchases: 12,
    status: 'active'
  },
  {
    id: '5',
    name: 'Luis Rodríguez',
    email: 'luis@example.com',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    sales: 76,
    purchases: 19,
    status: 'inactive'
  }
];

// Datos ficticios para productos
const mockProducts: Product[] = [
  {
    id: '101',
    name: 'Logitech G Pro X Superlight 2',
    price: 159.99,
    image: 'https://res.cloudinary.com/dnnxgzqzv/image/upload/v1744377178/design-large-removebg-preview_1_rysmbg_vj04id.webp',
    sales: 63,
    stock: 7,
    status: 'available'
  },
  {
    id: '102',
    name: 'Shure SM7B Microphone',
    price: 399.99,
    image: 'https://res.cloudinary.com/dnnxgzqzv/image/upload/v1744368523/750_750-SHURE_-_SM7B_-_T1121805024_-_6-removebg-preview_giqx82_colyxe.webp',
    sales: 57,
    stock: 2,
    status: 'available'
  },
  {
    id: '103',
    name: 'iPhone 15 Pro Max',
    price: 1199.99,
    image: 'https://res.cloudinary.com/dnnxgzqzv/image/upload/v1744377388/50947-producto-iphone-15-pro-max-removebg-preview_hb66f0_ed8zdf.webp',
    sales: 43,
    stock: 5,
    status: 'available'
  },
  {
    id: '104',
    name: 'Noblechairs Hero',
    price: 489.99,
    image: 'https://res.cloudinary.com/dnnxgzqzv/image/upload/v1743084360/66f75b3cb80cdecf0d67722bcc7a6fda-removebg-preview_eoawm4.png',
    sales: 32,
    stock: 2,
    status: 'available'
  },
  {
    id: '105',
    name: 'HP Spectre x360 14',
    price: 1599.99,
    image: 'https://res.cloudinary.com/dnnxgzqzv/image/upload/v1744369221/FEED_04-2-removebg-preview_p4uvwh_rpjzkn.webp',
    sales: 12,
    stock: 6,
    status: 'available'
  },
];

export function Tables() {
  const [activeItem, setActiveItem] = useState<User | Product | null>(null);
  const [showUsers, setShowUsers] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'sales', 
    direction: 'desc' 
  });
  const [realUsers, setRealUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  

  // Obtener usuarios reales del backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {                           
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/all`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Error al obtener usuarios');
        }

        const data = await response.json();
        setRealUsers(data);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Combinar usuarios ficticios con reales
  const combinedUsers = [...mockUsers, ...realUsers];

  // Ordenar datos
  const sortedUsers = [...combinedUsers].sort((a, b) => {
    if (a[sortConfig.key as keyof User] < b[sortConfig.key as keyof User]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof User] > b[sortConfig.key as keyof User]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const sortedProducts = [...mockProducts].sort((a, b) => {
    if (a[sortConfig.key as keyof Product] < b[sortConfig.key as keyof Product]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof Product] > b[sortConfig.key as keyof Product]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };

    document.body.style.overflow = activeItem ? "hidden" : "auto";
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem]);

  return (
    <>
      <Header />

      <div className={styles.tableContainer}>
        <div className={styles.tableSwitcher}>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className={styles.switchButton}
            disabled={isLoading}
            >
            <FaExchangeAlt className={styles.icon} />
            {showUsers ? "View products" : "View Users"}
            {isLoading && <span className={styles.loadingSpinner} />}
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading data...</p>
          </div>
        ): (
          <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr className={styles.tableRow}>
                <th className={styles.tableHeader}>
                  {showUsers ? <FaUser className={styles.icon} /> : <FaShoppingBag className={styles.icon} />}
                  {showUsers ? "Users" : "Products"}
                </th>
                <th 
                  className={`${styles.tableHeader} ${styles.sortable}`}
                  onClick={() => requestSort('sales')}
                >
                  <FaDollarSign className={styles.icon} />
                  Sales
                  {sortConfig.key === 'sales' && (
                    <span className={styles.sortIndicator}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>

              </tr>
            </thead>
            <tbody>
              {(showUsers ? sortedUsers : sortedProducts).map((item) => (
                <motion.tr 
                  key={item.id}
                  className={styles.tableRow}
                  onClick={() => setActiveItem(item)}
                  whileHover={{ scale: 1.01 }}
                >
                  <td className={`${styles.tableCell} ${styles.userCell}`}>
                    <img 
                      src={item.image} 
                      alt={showUsers ? (item as User).name : (item as Product).name} 
                      className={styles.userImage}
                    />
                    <div>
                      <div className={styles.primaryText}>
                        {showUsers ? (item as User).name : (item as Product).name}
                      </div>
                      {showUsers && (
                        <div className={styles.secondaryText}>
                          {(item as User).email}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className={`${styles.tableCell} ${styles.salesCell}`}>
                    <span className={styles.salesCount}>{item.sales}</span>
                  </td>
                  
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

      </div>

      <AnimatePresence>
        {activeItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.modalOverlay}
            />
            
            <div className={styles.modalContainer} onClick={(e) => {
                if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                  setActiveItem(null);
                }
              }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 50 }}
                  className={styles.modalContent}
                  ref={modalRef}
                  onClick={(e) => e.stopPropagation()}
                >
                <button
                  className={styles.modalClose}
                  onClick={() => setActiveItem(null)}
                >
                  <FaTimes />
                </button>
                
                <div className={styles.modalHeader}>
                  <img
                    src={activeItem.image}
                    alt={showUsers ? (activeItem as User).name : (activeItem as Product).name}
                    className={styles.modalImage}
                  />
                  <h3 className={styles.modalTitle}>
                    {showUsers ? (activeItem as User).name : (activeItem as Product).name}
                  </h3>
                  {showUsers && (
                    <p className={styles.modalSubtitle}>{(activeItem as User).email}</p>
                  )}
                </div>

                <div className={styles.modalDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Sales:</span>
                    <span className={styles.detailValue}>{activeItem.sales}</span>
                  </div>

                  {showUsers ? (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Purchases:</span>
                      <span className={styles.detailValue}>{(activeItem as User).purchases}</span>
                    </div>
                  ) : (
                    <>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Price:</span>
                        <span className={styles.detailValue}>${(activeItem as Product).price.toLocaleString()}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Stock:</span>
                        <span className={styles.detailValue}>{(activeItem as Product).stock}</span>
                      </div>
                    </>
                  )}

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>State:</span>
                    <span className={`${styles.detailValue} ${styles.status} ${showUsers ? 
                      styles[(activeItem as User).status] : 
                      styles[(activeItem as Product).status]
                    }`}>
                      {showUsers ? 
                        (activeItem as User).status === 'active' ? 'Active' : 'Inactive' : 
                        (activeItem as Product).status === 'available' ? 'Available' : 'Our of stock'
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}