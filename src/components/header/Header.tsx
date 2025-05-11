import { useContext, useEffect, useRef, useState } from "react";
import { Search, Bell, User, Home, MessageSquare, Grid, HelpCircle, Calendar } from "lucide-react";
import { FaBoxOpen, FaRegUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import KeylaShoppingCart from "../shoppingCart/ShoppingCart";
import { useCart } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";
import {jwtDecode} from "jwt-decode"; 
import { RiContactsBook2Fill } from "react-icons/ri";
import { RiContactsBook2Line } from "react-icons/ri";
import "./header.css";

const Header = () => {

  // Para desktop (original)
    const desktopMenuItems = ["Home", "Chats", "Tables", "Support", "Plans", "Contact us"];

  // Para mobile
  const mobileMenuItems = [
    { name: "Home", icon: <Home size={24} /> },
    { name: "Chats", icon: <MessageSquare size={24} /> },
    { name: "Tables", icon: <Grid size={24} /> },
    { name: "Support", icon: <HelpCircle size={24} /> },

   /*  { name: "Plans", icon: <Calendar size={24} /> } */
   { name: "Contact us", icon: <RiContactsBook2Line size={24} /> },
   { name: "Profile", icon: <FaRegUser size={24} /> }
  ];

  const mainPages = ["/", "/Home", "/Chats", "/chats", "/Tables", "/Support", "/Contact%20us", "/Profile", "/profile", "/Plans", "/plans"];
  
  const [active, setActive] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1113);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();
  const { clearCart } = useCart();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/Home";
  const menuRef = useRef<HTMLDivElement>(null);
  const userIconRef = useRef<HTMLSpanElement>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showTopBar, setShowTopBar] = useState(true);
  const hideTimeoutRef = useRef<number | null>(null);
  const isMainPage = mainPages.includes(location.pathname);

  if(!isMainPage) return null;

   useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Solo ocultar/mostrar si es mobile y estamos en la página de inicio
      if (!isMobile || !isHomePage) {
        setShowTopBar(true);
        return;
      }
  
      // Determinar dirección del scroll
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Ocultar solo si:
      // 1. El scroll es hacia abajo
      // 2. No hay contenido en el search
      // 3. El search no está enfocado
      if (scrollDirection === 'down' && 
          searchTerm.trim().length === 0) {
        setShowTopBar(false);
      } else if (scrollDirection === 'up') {
        setShowTopBar(true);
      }
  
      setLastScrollY(currentScrollY);
    };
  
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile, searchTerm, isHomePage]);



  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1113);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(()=> {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        menuRef.current &&
        userIconRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !userIconRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const isTokenExpired = (token: string):boolean => {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };

  const toggleCart = () => {
    setIsCartVisible((prev) => !prev);
    setShowMenu(false);
  };

  const handleSearchChange = (e:any) => {
    setSearchTerm(e.target.value);
  }

  useEffect(() => {
    const path = window.location.pathname.replace("/", "");
    setActive(path || "Home");
  }, []);

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

  return (
    <header className={`header ${isMobile ? 'mobile-header' : 'desktop-header'}`}>
      {isMobile ? (
        /* Versión Mobile */
        <>
      {isHomePage && (
            <div className={`top-bar ${showTopBar ? 'visible' : 'hidden'}`}>
              <div className="logo-container">
                <img
                  className="logo-img"
                  src="https://res.cloudinary.com/dnnxgzqzv/image/upload/v1746906159/K_d96reb.png"
                  alt="logo"
                />
              </div>
              
              <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setShowTopBar(true);
                    // Cancelar timeout al enfocar
                    if (hideTimeoutRef.current) {
                      clearTimeout(hideTimeoutRef.current);
                      hideTimeoutRef.current = null;
                    }
                  }}

                />
              </div>
              
              <div className="icons-container">
                <Link to={'/plans'}>
                  <Calendar size={20} className="header-icon" />
                </Link>
                <ShoppingCart size={20} className="header-icon" onClick={toggleCart} />
              </div>
            </div>
          )}
        

          <nav className="bottom-bar">
            {mobileMenuItems.map((item) => (
              <Link 
                to={`/${item.name}`} 
                key={item.name}
                className={`menu-item ${active.toLowerCase() === item.name.toLowerCase() ? "active" : ""}`}
              >
                {item.icon}
              </Link>
              
            ))}
          </nav>
        </>
      ) : (
        /* Versión Desktop (original) */
        <nav className="myNavsi w-full bg-gray-900 p-4 flex justify-between items-center border-b border-white-700 myNav">
          <div className="flex items-center gap-4">
            <span className="text-indigo-400 text-2xl font-bold">
              <img
                className="logoImg"
                src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                alt="logo"
              />
            </span>
            <ul className="flex gap-6 ulNav">
              {desktopMenuItems.map((item) => (
                <Link to={`/${item}`} key={item}>
                  <li
                    className={`cursor-pointer text-gray-400 hover:text-white px-3 py-1 rounded-md transition-all ${
                      active.toLowerCase() === item.toLowerCase()
                        ? "bg-gray-700 text-white"
                        : ""
                    }`}
                  >
                    {item}
                  </li>
                </Link>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-700 px-3 py-1 rounded-md">
              <Search className="text-gray-400" size={16} />
              <input
                type="text"
                placeholder={isHomePage ? "Search" : "Search"}
                className="bg-transparent border-none outline-none px-2 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={isHomePage ? handleSearchChange : undefined}
                disabled={!isHomePage}
                style={{ opacity: isHomePage ? 1 : 0.5 }}
              />
            </div>
            
            <Link to={'/profile'}>
              <span ref={userIconRef} className="flex items-center gap-2">
                <FaRegUser size={25} className="text-gray-400 cursor-pointer" />
              </span>
            </Link>

            <span onClick={toggleCart}>
              <ShoppingCart className="text-gray-400 cursor-pointer" />
            </span>
          </div>
        </nav>
      )}

      {isCartVisible && <KeylaShoppingCart onClose={toggleCart} />}
    </header>
  );
};

export default Header;