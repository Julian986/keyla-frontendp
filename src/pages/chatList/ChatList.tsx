import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer/Footer";
import { AuthContext } from "@/context/AuthContext";
import "./chatList.css"

interface Chat {
  _id: string;
  participants: {
    buyer: {
      _id: string;
      name: string;
      avatar?: string;
    };
    seller: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
  product: {
    _id: string;
    name: string;
    image?: string;
    price?: number;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

    useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, []);
  
  useEffect(() => {
    const fetchChats = async () => {
      // Verificamos autenticacion primero
      if (!auth?.isAuthenticated()) {
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await axios.get("/chat", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setChats(res.data.chats);
      } catch (err) {
        setError("Error loading conversations");
        console.error("Error fetching chats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);
  
  const getOtherParticipant = (chat: Chat) => {
    return auth?.user?._id === chat.participants.seller._id
      ? chat.participants.buyer
      : chat.participants.seller;
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (isLoading) return <div className="loading-chats">Loading conversations...</div>;
  if (error) return <div className="error-chats">{error}</div>;
  
  console.log("Chats", chats);
  return (
    <>
      <Header />
      <div className="chat-list-container">
        <hr className="laLiniita" />
        
        {!auth?.isAuthenticated() ? (
          <div className="no-chats">
            <p className="colordad">You must log in to view your conversations</p>
            <button onClick={() => navigate("/login")}>Log in</button>
          </div>
        ) : chats.length === 0 ? (
          <div className="no-chats">
            <p className="colordad">You have no active conversations</p>
            <button onClick={() => navigate("/")}>Explore products</button>
          </div>
        ) : (
          <ul className="chat-list">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              return (
                <li key={chat._id} className="chat-itemsito">
                  <Link to={`/chat/${chat._id}`} className="chat-link">
                    <div className="chat-avatar">
                      {chat.product.image ? (
                        <img 
                        src={chat.product.image} 
                          alt={otherParticipant.name}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {otherParticipant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="chat-info">
                      <div className="chat-headersito">
                        <h3 className="participantName">{otherParticipant.name}</h3>
                        {chat.lastMessage && (
                          <span className="chat-timesito">
                            {formatTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      {chat.lastMessage && (
                        <p className="last-message">
                          {chat.lastMessage.content.substring(0, 60)}...
                        </p>
                      )}
                    </div>
                    
                    {chat.unreadCount > 0 && (
                      <span className="unread-badge">
                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ChatList;