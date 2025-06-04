import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-3i4l.onrender.com');

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
    <div>
      <h3>Chat with: {chatWith}</h3>
      <div style={{ border: '1px solid #ccc', height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <div key={idx}><b>{msg.sender}:</b> {msg.message}</div>
        ))}
      </div>
      <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message" />
      <button onClick={sendMessage}>Send</button>
      <button onClick={() => setScreen('select')}>Back</button>
    </div>
  );
}

export default ChatBox;
