import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './ChatBox.css';

const socket = io('https://chat-app-4apm.onrender.com');

function ChatBox({ sender, receiver, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    socket.emit('join', { sender, receiver });

    const fetchMessages = async () => {
      try {
        const res = await fetch(`https://chat-app-4apm.onrender.com/messages/${sender}/${receiver}`);
        const data = await res.json();
        const formatted = data.map(msg => ({
          ...msg,
          image_url: msg.image_url ? `https://chat-app-4apm.onrender.com${msg.image_url}` : ''
        }));
        setMessages(formatted);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();

    socket.on('receive_message', (data) => {
      if (data.image_url) {
        data.image_url = `https://chat-app-4apm.onrender.com${data.image_url}`;
      }
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [sender, receiver]);

  const sendMessage = async () => {
    if (!message && !image) return;

    let image_url = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const res = await fetch('https://chat-app-4apm.onrender.com/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          image_url = data.url;
        } else {
          alert('Image upload failed');
          return;
        }
      } catch (err) {
        console.error('Image upload error:', err);
        return;
      }
    }

    const msgData = {
      sender,
      receiver,
      message,
      image_url,
    };

    socket.emit('send_message', msgData);

    setMessages((prev) => [
      ...prev,
      {
        ...msgData,
        image_url: image_url ? `https://chat-app-4apm.onrender.com${image_url}` : '',
        timestamp: new Date().toISOString(),
      },
    ]);

    saveChatHistory(receiver);

    setMessage('');
    setImage(null);
    setPreviewUrl(null);
  };

  const saveChatHistory = (partnerId) => {
    const historyKey = `${sender}_chatHistory`;
    const existing = JSON.parse(localStorage.getItem(historyKey)) || [];
    if (!existing.includes(partnerId)) {
      const updated = [...existing, partnerId];
      localStorage.setItem(historyKey, JSON.stringify(updated));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Baat Karo Na</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === sender ? 'sent' : 'received'}`}>
            {msg.message && <p>{msg.message}</p>}
            {msg.image_url && (
              <img
                src={msg.image_url}
                alt="shared"
                className="chat-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/broken-image.png';
                }}
              />
            )}
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" className="preview-img" />
          </div>
        )}
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
