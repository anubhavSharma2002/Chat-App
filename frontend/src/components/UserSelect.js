import React, { useState } from 'react';
import { api } from '../api';
import './UserSelect.css';

function UserSelect({ setChatWith, setScreen }) {
  const [otherId, setOtherId] = useState('');

  const handleStartChat = async () => {
    try {
      const res = await api.post('/auth/check-user', { email: otherId });
      if (res.data.exists) {
        setChatWith(otherId);
        setScreen('chat');
      } else {
        alert('User ID not found!');
      }
    } catch {
      alert('Server error. Try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setScreen('login');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleStartChat();
  };

  return (
    <div className="userselect-container">
      <h2>Start Chat</h2>
      <input placeholder="Enter email of user to chat" value={otherId} onChange={e => setOtherId(e.target.value)} onKeyDown={handleKeyDown} />
      <button onClick={handleStartChat}>Chat</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default UserSelect;
