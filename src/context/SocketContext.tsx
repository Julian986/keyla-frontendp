// src/context/SocketContext.tsx
import { io, Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isInitialized: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isInitialized: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const auth = useContext(AuthContext);

  useEffect(() => {   
    const token = localStorage.getItem("token");

    // process.env.REACT_APP_API_URL || "http://localhost:4500"
    const socketInstance = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"] // Intenta ambos métodos
    });

    const onConnect = () => {
      setIsConnected(true);
      console.log("Socket conectado");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("Socket desconectado");
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    // Manejar errores de conexión
    socketInstance.on("connect_error", (err) => {
      console.error("Error de conexión Socket.io:", err.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);
    setIsInitialized(true);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.disconnect(); 
    };
  }, [auth?.user?._id]); // Dependencia del token


  return (
    <SocketContext.Provider value={{ socket, isConnected, isInitialized }}>
      {children}
    </SocketContext.Provider>
  );
};