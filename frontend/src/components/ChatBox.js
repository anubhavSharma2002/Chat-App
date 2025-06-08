import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './ChatBox.css';
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const socket = io('https://chat-app-4apm.onrender.com');

function ChatBox({ sender, receiver, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contactName, setContactName] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const names = JSON.parse(localStorage.getItem(`${sender}_contactNames`)) || {};
    setContactName(names[receiver] || receiver);

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

    socket.on('typing', (data) => {
      if (data.sender === receiver) {
        setPartnerTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('typing');
    };
  }, [sender, receiver, selectedMessageId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.emit('typing', { sender, receiver, isTyping });
  }, [isTyping]);

  const sendMessage = async () => {
    if (!message.trim() && !image) return;

    let image_url = '', public_id = '';

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

    const msgData = { sender, receiver, message, image_url, public_id };
    socket.emit('send_message', msgData);
    setMessage('');
    setImage(null);
    setPreviewUrl(null);
    setShowEmojiPicker(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageClickToDownload = async (public_id) => {
    if (!public_id) return;
    try {
      const res = await fetch(`https://chat-app-4apm.onrender.com/download-image?public_id=${public_id}`);
      const data = await res.json();
      if (data.download_url) {
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `image_${public_id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Download failed');
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
    const msg = messages.find((m) => m.id === id);
    if (msg && msg.sender === sender)
      setSelectedMessageId(selectedMessageId === id ? null : id);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>{contactName}</h2>
        {selectedMessageId && (
          <button className="delete-btn" onClick={handleDelete}>🗑️ Delete</button>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender === sender ? 'sent' : 'received'} ${selectedMessageId === msg.id ? 'selected' : ''}`}
            onDoubleClick={() => handleSelect(msg.id)} // desktop
            onTouchStart={() => {
              this.longPressTimer = setTimeout(() => handleSelect(msg.id), 600);
            }}
            onTouchEnd={() => clearTimeout(this.longPressTimer)}
      >
            {msg.message && <p>{msg.message}</p>}
            {msg.image_url && (
              <div className="image-container">
                <img
                  src={msg.image_url}
                  alt="shared"
                  className="chat-image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClickToDownload(msg.public_id);
                  }}
                  title="Click to download"
                />
              </div>
            )}
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {partnerTyping && <div className="typing-indicator">Typing...</div>}
        <div ref={bottomRef}></div>
      </div>

      {previewUrl && (
        <div className="image-preview" onClick={() => { setPreviewUrl(null); setImage(null); }}>
          <img src={previewUrl} alt="Preview" className="preview-img" />
        </div>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <div className="chat-input-bar">
        <label htmlFor="file-input" className="attachment-icon"><FaPaperclip /></label>
        <input id="file-input" type="file" accept="image/*" onChange={handleImageChange} />
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setIsTyping(e.target.value.length > 0);
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="emoji-icon" onClick={() => setShowEmojiPicker((prev) => !prev)}><FaSmile /></button>
        <button className="send-icon" onClick={sendMessage}><FaPaperPlane /></button>
      </div>
    </div>
  );
}

export default ChatBox;
