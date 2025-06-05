import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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
    <div className="fade-in">
      <h2>Chat with: {chatWith}</h2>
      <div style={{
        border: '2px solid #ffcc80',
        borderRadius: '10px',
        background: '#fff8e1',
        height: '300px',
        overflowY: 'scroll',
        padding: '10px',
        marginBottom: 10
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} className="message-box">
            <strong>{msg.sender}:</strong> {msg.message}
            <div style={{ fontSize: '0.75em', color: 'gray' }}>
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={() => setScreen('select')}>Back</button>
    </div>
  );
}

export default ChatBox;
