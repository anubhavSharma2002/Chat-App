import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './ChatBox.css';

const socket = io('https://chat-app-4apm.onrender.com', {
  transports: ['websocket'],
  withCredentials: true,
});

function ChatBox({ userId, chatWith, setScreen }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('join', { user: userId, other_user: chatWith });

    socket.on('chat_history', (msgs) => {
      setMessages(msgs);
    });

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off();
  }, [userId, chatWith]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', {
        sender: userId,
        receiver: chatWith,
        message
      });
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chatbox-container">
      <h3>Chat with: {chatWith}</h3>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chat-message">
            <b>{msg.sender}:</b> {msg.message}
            <small className="timestamp">
              {new Date(msg.timestamp).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        className="message-input"
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={() => setScreen('select')}>Back</button>
    </div>
  );
}

export default ChatBox;
