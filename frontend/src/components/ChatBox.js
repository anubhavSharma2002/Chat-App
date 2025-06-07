import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './ChatBox.css';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';

const socket = io('https://chat-app-4apm.onrender.com');

function ChatBox({ sender, receiver, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  useEffect(() => {
    socket.emit('join', { sender, receiver });

    const fetchMessages = async () => {
      try {
        const res = await fetch(`https://chat-app-4apm.onrender.com/messages/${sender}/${receiver}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('message_deleted', (data) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.message_id));
      if (selectedMessageId === data.message_id) setSelectedMessageId(null);
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
    };
  }, [sender, receiver, selectedMessageId]);

  const sendMessage = async () => {
    if (!message.trim() && !image) return;

    let image_url = '';
    let public_id = '';

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
          public_id = data.public_id;
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
      public_id,
    };

    socket.emit('send_message', msgData);
    setMessage('');
    setImage(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDownload = async (public_id) => {
    try {
      const res = await fetch(`https://chat-app-4apm.onrender.com/download-image?public_id=${public_id}`);
      const data = await res.json();
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      } else {
        alert('Failed to generate download link');
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = () => {
    if (!selectedMessageId) return;
    socket.emit('delete_message', { message_id: selectedMessageId });
    setSelectedMessageId(null);
  };

  const handleSelect = (id) => {
    const selectedMsg = messages.find((msg) => msg.id === id);
    if (selectedMsg && selectedMsg.sender === sender) {
      setSelectedMessageId(selectedMessageId === id ? null : id);
    } else {
      setSelectedMessageId(null);
    }
  };

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>{receiver}</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === sender ? 'sent' : 'received'} ${selectedMessageId === msg.id ? 'selected' : ''}`}
            onClick={() => handleSelect(msg.id)}
          >
            {msg.message && <p>{msg.message}</p>}

            {msg.image_url && (
              <div className="image-container">
                <img
                  src={msg.image_url}
                  alt="shared"
                  className="chat-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                {msg.public_id && (
                  <button className="download-btn" onClick={(e) => { e.stopPropagation(); handleDownload(msg.public_id); }}>
                    Download
                  </button>
                )}
              </div>
            )}
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" className="preview-img" />
        </div>
      )}

      <div className="chat-input-bar">
        <label htmlFor="file-input" className="attachment-icon">
          <FaPaperclip />
        </label>
        <input id="file-input" type="file" accept="image/*" onChange={handleImageChange} />
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="send-icon" onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
