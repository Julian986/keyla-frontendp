import { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface User {
  _id: string;
  name: string;
  email?: string;
  image?: string;
  description?: string;
  location?: string;
  phone?: string;
  // Agrega otros campos relevantes del usuario aquí
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (name: string, password: string) => Promise<{success: boolean, userData?: User}>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isAuthenticated: () => boolean;
  
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuración inicial de axios
axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_URL}`;
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
         /*  localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"]; */
          return Promise.reject(new Error("Token expired"));
        }
        
        config.headers["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error decoding token", error);
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }, []);

  const fetchUserData = useCallback(async (token: string) => {
    try {
      console.log("Token usado en fetchUserData:", token); // Para depuración
      
      const response = await axios.get("/user/me", {
        headers: {
           "Authorization": `Bearer ${token}`
        }
      });
      
      console.log("Datos recibidos del usuario:", response.data);
      
      setUser({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        image: response.data.image || '/default-user.jpg',
        description: response.data.description || '',
        location: response.data.location || '',
        phone: response.data.phone || ''
      });
    } catch (error) {
      console.error("Error completo en fetchUserData:", error);
      if (axios.isAxiosError(error)) {
        console.error("Status code:", error.response?.status);
        console.error("Error response:", error.response?.data);
      }
      logout();
    }
  }, []);

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        return;
      }
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserData(token);
    }
  }, [token, isTokenExpired, fetchUserData]);


  const login = async (name: string, password: string): Promise<{success: boolean, userData?: User}> => {
    try {
        const response = await axios.post("/auth/login", { name, password });

        if (!response.data.token) {
            console.error('[AuthContext] El backend no devolvió token');
            return {success: false};
        }

        const { token: newToken, user: userData } = response.data;
     
        localStorage.setItem("token", newToken); 
        setToken(newToken);

    // Obtener datos completos del usuario después del login
    const userResponse = await axios.get("/user/me", {
      headers: {
        "Authorization": `Bearer ${newToken}`
      }
    });

    const completeUserData = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      image: userData.image || '',
      description: userResponse.data.description || '',
      location: response.data.location || '',
      phone: response.data.phone || ''
    };
    setUser(completeUserData);
    return {success: true, userData: completeUserData};

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('[AuthContext] Detalles del error:', {
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
        }
       return {success: false};
    }
};

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
   /*  window.location.href = "/login"; */
  }, []);
  
  const updateUser = (updatedData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const isAuthenticated = () => {
    return !!token && !isTokenExpired(token!);
  };

  console.log('User information: ', user);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      updateUser,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};