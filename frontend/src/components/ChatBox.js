import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './ChatBox.css';
import { FaPaperPlane, FaPaperclip, FaArrowLeft, FaCheck, FaCheckDouble } from 'react-icons/fa';

const socket = io('https://chat-app-4apm.onrender.com');

const formatTimestampIST = (isoTimestamp) => {
  const date = new Date(isoTimestamp);
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const isToday = istDate.toDateString() === now.toDateString();

  const timeStr = istDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  } else {
    const dateStr = istDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${dateStr} at ${timeStr}`;
  }
};

function ChatBox({ sender, receiver, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [contactNames, setContactNames] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedNames = JSON.parse(localStorage.getItem(`${sender}_contactNames`)) || {};
    setContactNames(storedNames);
  }, [sender]);

  useEffect(() => {
    socket.emit('join', { sender, receiver });

    socket.on('receive-message', (data) => {
      setMessages(prev => [...prev, { ...data, received: true }]);
      setNotification(true);
    });

    socket.on('typing', (status) => {
      setIsTyping(status);
    });

    socket.on('seen-update', () => {
      setMessages(prev =>
        prev.map(msg =>
          msg.sender === sender ? { ...msg, seen: true } : msg
        )
      );
    });

    return () => {
      socket.off('receive-message');
      socket.off('typing');
      socket.off('seen-update');
    };
  }, [sender, receiver]);

  useEffect(() => {
    scrollToBottom();
    if (notification) {
      setTimeout(() => setNotification(false), 2000);
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg = {
      sender,
      receiver,
      content: message,
      timestamp: new Date().toISOString(),
      seen: false,
    };
    socket.emit('send-message', newMsg);
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { to: receiver, typing: true });
    setTimeout(() => socket.emit('typing', { to: receiver, typing: false }), 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getContactName = () => contactNames[receiver] || receiver;

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <button onClick={onBack}><FaArrowLeft /></button>
        <div className="header-info">
          <span className="chat-name">{getContactName()}</span>
          {notification && <span className="notification-dot" />}
        </div>
      </div>

      <div className="chatbox-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-bubble ${msg.sender === sender ? 'sent' : 'received'}`}
          >
            {msg.content.startsWith('data:image') ? (
              <img src={msg.content} alt="sent" className="image-message" />
            ) : (
              <span>{msg.content}</span>
            )}
            <div className="message-info">
              <span className="timestamp">{formatTimestampIST(msg.timestamp)}</span>
              {msg.sender === sender && (
                <span className="status-icon">
                  {msg.seen ? <FaCheckDouble color="blue" /> : <FaCheck />}
                </span>
              )}
            </div>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbox-input">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <label htmlFor="file-upload">
          <FaPaperclip className="icon" />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const newMsg = {
                sender,
                receiver,
                content: reader.result,
                timestamp: new Date().toISOString(),
                seen: false,
              };
              socket.emit('send-message', newMsg);
              setMessages(prev => [...prev, newMsg]);
            };
            reader.readAsDataURL(file);
          }}
        />
        <button onClick={handleSend}><FaPaperPlane /></button>
      </div>
    </div>
  );
}

export default ChatBox;
