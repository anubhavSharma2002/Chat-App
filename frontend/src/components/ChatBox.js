import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-4apm.onrender.com', {
  transports: ['websocket'],
  withCredentials: true,
});

function ChatBox({ userId, chatWith, setScreen }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = {
        sender: userId,
        receiver: chatWith,
        message
      };
      socket.emit('send_message', msgData);
      setMessages(prev => [...prev, { ...msgData, timestamp: new Date() }]);
      setMessage('');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-container">
      <h3>Chat with: {chatWith}</h3>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === userId ? 'sent' : 'received'}`}
          >
            <div>{msg.message}</div>
            <small>{new Date(new Date(msg.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleTimeString('en-IN')}</small>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="input-area">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={() => setScreen('select')}>Back</button>
      </div>
    </div>
  );
}

export default ChatBox;
