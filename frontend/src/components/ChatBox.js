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

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">Chat with: {chatWith}</div>
      <div className="chatbox-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chatbox-message">
            <b>{msg.sender}:</b> {msg.message}
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <input
        className="chatbox-input"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button className="chatbox-button" onClick={sendMessage}>Send</button>
      <button className="chatbox-button" onClick={() => setScreen('select')}>Back</button>
    </div>
  );
}

export default ChatBox;
