import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import MessageBubble from "./MessageBubble";
import { IMessage } from "@/types/chat";
import "./chat.css";


interface ChatParticipant {
  _id: string;
  name: string;
  avatar?: string;
  image?: string;
}

interface ChatInfo {
  product: {
    _id: string;
    name: string;
    image?: string;
  };
  participants: {
    buyer: ChatParticipant;
    seller: ChatParticipant;
  };
}

const ChatWindow = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const auth = useContext(AuthContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { socket, isConnected } = useSocket();
  const [socketReady, setSocketReady] = useState(false);
  
  useEffect(() => {
    if (isConnected && socket && chatId) {
      // Un pequeño retraso para asegurar que todo esté listo
      const timer = setTimeout(() => {
        socket.emit("join-chat", chatId);
        setSocketReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSocketReady(false);
    }
  }, [isConnected, socket, chatId]);

/*   useEffect(() => {
    console.log("¿Socket conectado?", isConnected);
  }, [isConnected]);
   */

  // Cargar mensajes iniciales y información del chat
  useEffect(() => {
    if (!chatId || !/^[0-9a-fA-F]{24}$/.test(chatId)) {
      setError("ID de chat inválido");
      navigate("/chats");
      return;
    }

    
    const fetchChatData = async () => {
      // Verifica el token antes de conectar el socket
  console.log('Token que se enviará:', localStorage.getItem('token'));
  
  // Verifica el usuario autenticado
  console.log('Usuario actual:', auth?.user);
      try {
        const [messagesRes, chatRes] = await Promise.all([
          axios.get(`/chat/${chatId}/messages`, {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          }),
          axios.get(`/chat/${chatId}`, {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          })
        ]);
        
        setMessages(messagesRes.data.messages);
        setChatInfo(chatRes.data.chatInfo);
      } catch (error:any) {
        console.error("Error cargando chat:", error);
        setError(error.response?.data?.error || "Error al cargar el chat");
        navigate("/chats");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatData();
  }, [chatId, navigate]);

  // Configurar Socket.io
  useEffect(() => {
    if (!socket || !chatId) return;

    if (isConnected) {
      socket.emit("join-chat", chatId);
    }

    socket.on("receive-message", (message: IMessage) => {
      // Filtrar mensajes temporales al recibir uno real
      console.log("Mensaje recibido por socket:", message);
      setMessages(prev => [
        ...prev.filter(msg => !msg.isTemp),
        message
      ]);
    });

    socket.on("message-sent", (savedMessage: IMessage) => {
      // Reemplazar mensaje temporal con el definitivo
      setMessages(prev => prev.map(msg => 
        msg.isTemp && msg.sender === auth?.user?._id && msg.content === savedMessage.content
          ? savedMessage
          : msg
      ));
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-sent");
    };
  }, [socket, isConnected, chatId, auth?.user?._id]);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth?.user || !socket || !isConnected || !chatId) return;

    const tempMessage: IMessage = {
      _id: `temp-${Date.now()}`,
      chat: chatId,
      sender: auth.user._id,
      content: newMessage,
      createdAt: new Date(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      socket.emit("send-message", {
        chatId,
        content: newMessage,
      }, (response: { status: string; error?: string }) => {
        if (response.status === "error") {
          console.error("Error del servidor:", response.error);
          setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        }
      });
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  if (isLoading) return <div className="loading">Cargando chat...</div>;
  if (!chatInfo) return <div className="error">No se pudo cargar la información del chat</div>;

  const otherParticipant = auth?.user?._id === chatInfo.participants.seller._id 
    ? chatInfo.participants.buyer 
    : chatInfo.participants.seller;

  return (
    <div className="chat-container">
      {/* Encabezado del chat */}
      <div className="chat-header">
        <div className="product-info">
          <img 
            src={chatInfo.product.image || "/default-product.png"} 
            alt={chatInfo.product.name}
            className="product-image"
          />
          <div className="participants-info">
            <h3>{chatInfo.product.name}</h3>
          {/* <div className="participants-names">
              <span>Vendedor: {chatInfo.participants.seller.name}</span>
              <span>Comprador: {chatInfo.participants.buyer.name}</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="messages-area">
        {messages.map((msg) => {
/*            console.log("Mensaje completo:", msg);
           console.log("Sender del mensaje:", msg.sender);
           console.log("ID del vendedor:", chatInfo.participants.seller._id);
           console.log("ID del comprador:", chatInfo.participants.buyer._id); */

           const isOwn = (() => {
            // Si sender es un objeto con _id
            if (msg.sender && typeof msg.sender === 'object' && '_id' in msg.sender) {
              return msg.sender._id?.toString() === auth?.user?._id?.toString();
            }
            // Si sender es solo el ID
            return msg.sender?.toString() === auth?.user?._id?.toString();
          })();
                    
          console.log(`Mensaje de ${msg.sender} (usuario actual: ${auth?.user?._id}) - isOwn: ${isOwn}`);

          

    // Función mejorada para obtener información del remitente
    const getSenderInfo = () => {
      // Si el mensaje es propio, devolver la info del usuario autenticado
      if (isOwn) {
        return {
          name: auth?.user?.name || 'You',
          image: auth?.user?.image || auth?.user?.image || '/default-avatar.png'
        };
      }
      
      // Si no es propio, determinar si es el vendedor o comprador
      const senderId = typeof msg.sender === 'object' ? msg.sender._id?.toString() : msg.sender?.toString();
      
      if (!senderId) return {
        name: 'Usuario',
        image: '/default-avatar.png'
      };
      
      // Comparar con los IDs de los participantes
      const { seller, buyer } = chatInfo.participants;
      
      if (senderId === seller._id?.toString()) return seller;
      if (senderId === buyer._id?.toString()) return buyer;
      
      return {
        name: "Usuario",
        image: "/default-avatar.png"
      };
    };

      const senderInfo = getSenderInfo();
      console.log('Datos del remitente:', {
        isOwn,
        senderName: isOwn ? "You" : senderInfo?.name || "Usuario",
        senderAvatar: senderInfo?.image || "/default-avatar.png",
        rawSender: msg.sender,
        authUser: auth?.user
      });

      return (
        <MessageBubble
          key={msg._id}
          message={msg}
          isOwn={isOwn}
          senderName={isOwn ? "You" : senderInfo?.name || "Usuario"}
          senderAvatar={senderInfo?.image || "/default-avatar.png"}
        />
      );
    })}
    <div ref={messagesEndRef} />
  </div>

      {/* Input de mensaje */}
      <form onSubmit={handleSendMessage} className="message-input-area">
{/*       Este input es el que no se activa a menos que recargues la pagina*/}        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="elInputProblematico"
          placeholder="Escribe un mensaje..."
          disabled={false}
        />
        <button type="submit" disabled={!isConnected || !newMessage.trim()}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;