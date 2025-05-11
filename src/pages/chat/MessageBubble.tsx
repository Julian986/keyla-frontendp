import { format } from "date-fns";
import { es } from "date-fns/locale";
import './messageBubble.css'

interface MessageBubbleProps {
  message: {
    content: string;
    createdAt: Date | string;
  };
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string;
}

const MessageBubble = ({ 
  message, 
  isOwn, 
  senderName, 
  senderAvatar 
}: MessageBubbleProps) => {
  console.log(`Renderizando MessageBubble - isOwn: ${isOwn}, senderName: ${senderName}`);
  const formattedTime = format(
    new Date(message.createdAt), 
    'HH:mm', 
    { locale: es }
  );

  return (
    <div className={`message-bubble ${isOwn ? "own-message" : "other-message"}`}>
      {/* Mostrar información del remitente para todos los mensajes */}
      <div className="message-sender">
        
          <img 
            src={senderAvatar} 
            alt={senderName}
            className="message-avatar"
          />
        
        <span className="sender-name">{senderName}</span>
      </div>
      <div className="message-content">
        <p>{message.content}</p>
        <span className="message-time">{formattedTime}</span>
      </div>
    </div>
  );
};

export default MessageBubble;