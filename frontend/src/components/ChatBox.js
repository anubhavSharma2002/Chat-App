import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-4apm.onrender.com');

const ChatBox = ({ userId, chatWith, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    socket.emit('join', { sender: userId, receiver: chatWith });
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [userId, chatWith]);

  const sendMessage = async () => {
    if (!message.trim() && !image) return;

    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const res = await fetch('https://chat-app-4apm.onrender.com/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        imageUrl = 'https://chat-app-4apm.onrender.com' + data.url;
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    const msgData = {
      sender: userId,
      receiver: chatWith,
      message: message.trim(),
      image_url: imageUrl,
    };

    socket.emit('send_message', msgData);
    setMessages((prev) => [...prev, { ...msgData, timestamp: new Date().toISOString() }]);
    setMessage('');
    setImage(null);
    setPreview(null);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onBack}>← Back</button>
        <h2>Chat with {chatWith}</h2>
      </div>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, idx) => (
          <div
            key={`${msg.timestamp}-${msg.sender}-${idx}`}
            className={`message ${msg.sender === userId ? 'sent' : 'received'}`}
          >
            {msg.message && <div>{msg.message}</div>}
            {msg.image_url && (
              <div>
                <img
                  src={msg.image_url}
                  alt="Shared"
                  className="shared-image"
                />
                <a href={msg.image_url} download target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </div>
            )}
            <small>{new Date(new Date(msg.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleTimeString('en-IN')}</small>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
