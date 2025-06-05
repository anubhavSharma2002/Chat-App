import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

function ChatBox({ userId, chatWith, socket }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [emojiSuggestion, setEmojiSuggestion] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    socket.on('receive_message', (data) => {
      if (
        (data.from === chatWith && data.to === userId) ||
        (data.from === userId && data.to === chatWith)
      ) {
        setMessages((msgs) => [...msgs, data]);
      }
    });

    return () => socket.off('receive_message');
  }, [socket, userId, chatWith]);

  // Fetch emoji suggestion
  useEffect(() => {
    if (message.trim() === '') {
      setEmojiSuggestion('');
      return;
    }

    const fetchEmoji = async () => {
      try {
        const res = await fetch('http://localhost:5000/emoji_suggestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message }),
        });
        const data = await res.json();
        setEmojiSuggestion(data.emoji || '');
      } catch {
        setEmojiSuggestion('');
      }
    };

    fetchEmoji();
  }, [message]);

  const sendMessage = (type = 'text', content = null) => {
    if ((type === 'text' && message.trim() === '') || !chatWith) return;

    let msgContent = content;
    if (type === 'text') msgContent = message;

    const data = {
      from: userId,
      to: chatWith,
      type,
      content: msgContent,
    };

    socket.emit('send_message', data);
    setMessages((msgs) => [...msgs, data]);

    if (type === 'text') setMessage('');
    setEmojiSuggestion('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      sendMessage(file.type.startsWith('image/') ? 'image' : 'video', reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="chatbox-container">
      <div className="messages">
        {messages.map((m, idx) => (
          <div key={idx} className={m.from === userId ? 'message sent' : 'message received'}>
            {m.type === 'text' && <span>{m.content}</span>}
            {m.type === 'image' && <img src={m.content} alt="sent-img" />}
            {m.type === 'video' && (
              <video controls width="200">
                <source src={m.content} />
              </video>
            )}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        {emojiSuggestion && (
          <button
            className="emoji-suggestion"
            onClick={() => setMessage((m) => m + emojiSuggestion)}
            title="Add emoji"
          >
            {emojiSuggestion}
          </button>
        )}

        <button onClick={() => fileInputRef.current.click()}>📎</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
