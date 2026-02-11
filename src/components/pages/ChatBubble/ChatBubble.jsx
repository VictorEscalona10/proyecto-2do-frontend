// ChatBubble.jsx
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './ChatBubble.css';

export function ChatBubble({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Desconectado');
  
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) return;

    // Inicializar socket.io
    const newSocket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Conectado al chat');
      setStatus('Conectado');
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del chat');
      setStatus('Desconectado');
    });

    newSocket.on('new_message', (message) => {
      console.log('Nuevo mensaje recibido:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('chat_closed', (data) => {
      alert(`El chat ha sido cerrado por el administrador: ${data.closedBy}`);
      setCurrentChat(null);
      setMessages([]);
      setIsOpen(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, API_URL]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = async () => {
    if (!socket) return;
    
    if (!isOpen) {
      setIsOpen(true);
      setLoading(true);
      
      try {
        // Si es usuario normal, inicia o recupera chat
        if (user.role === 'USUARIO') {
          socket.emit('start_chat', {}, (response) => {
            if (response.success) {
              setCurrentChat(response.chat);
              if (response.chat.messages && response.chat.messages.length > 0) {
                setMessages(response.chat.messages);
              }
              // Unirse al chat
              socket.emit('join_chat', { chatId: response.chat.id }, (joinResponse) => {
                if (!joinResponse.success) {
                  console.error('Error uniéndose al chat:', joinResponse.message);
                }
              });
            } else {
              console.error('Error iniciando chat:', response.message);
            }
            setLoading(false);
          });
        } else {
          // Si es admin, obtiene sus chats
          socket.emit('get_my_chats', {}, (response) => {
            if (response.success && response.chats.length > 0) {
              setCurrentChat(response.chats[0]);
              // Cargar mensajes del primer chat
              loadChatMessages(response.chats[0].id);
            }
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  const loadChatMessages = (chatId) => {
    if (!socket) return;
    
    socket.emit('get_chat_messages', { chatId }, (response) => {
      if (response.success) {
        setMessages(response.messages);
      }
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !socket || loading) return;

    const messageToSend = newMessage;
    setNewMessage('');
    setLoading(true);

    socket.emit('send_message', {
      chatId: currentChat.id,
      text: messageToSend
    }, (response) => {
      setLoading(false);
      if (!response.success) {
        console.error('Error enviando mensaje:', response.message);
        setNewMessage(messageToSend);
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-bubble-container">
      <div className="chat-bubble" onClick={toggleChat}>
        <span className="chat-bubble-icon">💬</span>
      </div>

      {isOpen && (
        <div className="chat-modal">
          <div className="chat-header">
            <h3>💬 Chat de Soporte</h3>
            <button className="close-chat" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className="chat-status">
            Estado: {status} {currentChat && `| Chat #${currentChat.id.substring(0, 8)}`}
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                {loading ? 'Cargando mensajes...' : 'No hay mensajes aún. ¡Envía un saludo!'}
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.isAdmin ? 'admin' : 'user'}`}
                >
                  <span className="message-sender">
                    {msg.isAdmin ? 'Administrador' : 'Tú'} • {formatDate(msg.createdAt)}
                  </span>
                  <span className="message-text">{msg.text}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <form onSubmit={sendMessage} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="chat-input"
                disabled={loading || !currentChat}
              />
              <button
                type="submit"
                className="send-button"
                disabled={loading || !newMessage.trim() || !currentChat}
              >
                {loading ? '⏳' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}