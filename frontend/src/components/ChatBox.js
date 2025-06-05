import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './ChatBox.css';

const socket = io('https://chat-app-4apm.onrender.com');

function ChatBox({ sender, receiver, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    socket.emit('join', { sender, receiver });

    const fetchOldMessages = async () => {
      try {
        const res = await fetch(`https://chat-app-4apm.onrender.com/messages/${sender}/${receiver}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchOldMessages();

    socket.on('receive_message', (data) => {
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
          image_url = `https://chat-app-4apm.onrender.com${data.url}`;
        } else {
          console.error('Image upload failed:', data.error);
          return;
        }
      } catch (err) {
        console.error('Upload failed', err);
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
    setMessages((prev) => [...prev, { ...msgData, timestamp: new Date().toISOString() }]);
    setMessage('');
    setImage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Baat Karo Na</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender === sender ? 'sent' : 'received'}`}>
            {msg.message && <p>{msg.message}</p>}
            {msg.image_url && (
              <img
                src={msg.image_url}
                alt="shared"
                className="chat-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/broken-image-icon.png'; // fallback if image fails
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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
