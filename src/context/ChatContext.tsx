/* import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
    senderId: string;
    message: string;
    timeStamp: Date;
}

interface ChatContextType {
    socket: Socket | null;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        // Conectar al servidor de Socket.IO
        const newSocket = io("http://localhost:4500 1");
        setSocket(newSocket);

        // Escuchar mensajes recibidos
        newSocket.on("recive_message", (message) => {
            console.log('Mensajitoooo', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Limpiar la conexión al desmontar el componente
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <ChatContext.Provider value={{ socket, messages, setMessages }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext); */