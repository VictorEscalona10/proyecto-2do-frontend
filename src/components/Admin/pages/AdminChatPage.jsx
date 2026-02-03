import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminChatPage() {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  /* ================= SOCKET INIT ================= */
  useEffect(() => {
    const socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Admin conectado', socket.id);
      setConnected(true);

      socket.emit('get_my_chats', (res) => {
        console.log('Chats:', res);
        if (res?.success) setChats(res.chats);
      });
    });

    socket.on('disconnect', () => {
      console.log('Desconectado');
      setConnected(false);
    });

    socket.on('new_message', (msg) => {
      console.log('Nuevo mensaje', msg);
      if (msg.chatId === activeChat?.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.disconnect();
  }, [activeChat?.id]);

  /* ================= SELECT CHAT ================= */
  const openChat = (chat) => {
    const socket = socketRef.current;
    if (!socket) return;

    setActiveChat(chat);
    setMessages([]);

    socket.emit('join_chat', { chatId: chat.id }, () => {
      socket.emit('get_chat_messages', { chatId: chat.id }, (res) => {
        if (res?.success) setMessages(res.messages);
      });
    });
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    const socket = socketRef.current;
    if (!text.trim() || !activeChat) return;

    socket.emit(
      'send_message',
      { chatId: activeChat.id, text },
      (res) => {
        if (!res?.success) alert('Error enviando mensaje');
      }
    );

    setText('');
  };

  /* ================= UI ================= */
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* CHAT LIST */}
      <aside style={{ width: 300, borderRight: '1px solid #ddd', padding: 10 }}>
        <h3>Chats ({chats.length})</h3>
        {!connected && <p>Desconectado</p>}

        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => openChat(c)}
            style={{
              padding: 10,
              cursor: 'pointer',
              background: activeChat?.id === c.id ? '#eee' : 'transparent',
            }}
          >
            Chat #{c.id.slice(0, 6)}
            <br />
            <small>{c.status}</small>
          </div>
        ))}
      </aside>

      {/* CHAT AREA */}
      <main style={{ flex: 1, padding: 10 }}>
        {!activeChat ? (
          <p>Selecciona un chat</p>
        ) : (
          <>
            <h3>Chat #{activeChat.id.slice(0, 6)}</h3>

            <div style={{ height: '70vh', overflowY: 'auto', border: '1px solid #ddd', padding: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <b>{m.isAdmin ? 'Admin' : 'Cliente'}:</b> {m.text}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', marginTop: 10 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
