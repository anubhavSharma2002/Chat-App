import React, { useEffect, useState } from 'react';
import { api } from '../api';

function UserSelect({ userId, setChatWith, setScreen, onLogout }) {
  const [otherId, setOtherId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem(`${userId}_chatHistory`)) || [];
    setChatHistory(history);
  }, [userId]);

  const addToChatHistory = (chatUserId) => {
    let history = JSON.parse(localStorage.getItem(`${userId}_chatHistory`)) || [];
    if (!history.includes(chatUserId)) {
      history.push(chatUserId);
      localStorage.setItem(`${userId}_chatHistory`, JSON.stringify(history));
      setChatHistory(history);
    }
  };

  const handleStartChat = async () => {
    try {
      const res = await api.post('/auth/check-user', { email: otherId });
      if (res.data.exists) {
        addToChatHistory(otherId);
        setChatWith(otherId);
        setScreen('chat');
      } else {
        alert('User ID not found!');
      }
    } catch {
      alert('Server error. Try again.');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleStartChat();
  };

  const handleChatHistoryClick = (id) => {
    setChatWith(id);
    setScreen('chat');
  };

  return (
    <div className="form-container">
      <h2>Start Chat</h2>

      {chatHistory.length > 0 && (
        <>
          <h3>Recent Chats</h3>
          <ul className="chat-history-list">
            {chatHistory.map((id) => (
              <li
                key={id}
                onClick={() => handleChatHistoryClick(id)}
                className="chat-history-item"
              >
                {id}
              </li>
            ))}
          </ul>
        </>
      )}

      <input
        placeholder="Enter email of user to chat"
        value={otherId}
        onChange={e => setOtherId(e.target.value)}
        onKeyDown={handleKey}
      />
      <button onClick={handleStartChat}>Chat</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default UserSelect;
